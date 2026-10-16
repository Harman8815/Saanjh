"""
Duplicate guest detection.

Guests are scored pairwise and clustered with a union-find so that
"Jane Smith <jane@x>" and "J. Smith <jane@x>, 5551234567" land in one
cluster even when each pair only matches on one signal.

Scores (the strongest matching signal wins):

* identical normalised email ............... 1.0
* identical phone (last 10 digits) ........ 0.9
* identical first + last name ............. 0.8
* identical last name + full address ...... 0.6

A pair is a duplicate when it scores >= DUPLICATE_THRESHOLD (0.8), so email,
phone, and full-name matches all count and an address-only match does not.
"""

import re

DUPLICATE_THRESHOLD = 0.8

SCORE_EMAIL = 1.0
SCORE_PHONE = 0.9
SCORE_NAME = 0.8
SCORE_NAME_ADDRESS = 0.6


def normalise_text(value):
    """Lowercase and collapse to letters/digits so 'O'Brien-Smith' == 'obrien smith'."""
    letters = re.sub(r'[^a-z0-9\s]', '', (value or '').lower())
    return re.sub(r'\s+', ' ', letters).strip()


def normalise_email(email):
    return (email or '').strip().lower()


def normalise_phone(phone):
    """Digits only, compared on the last 10 so +91/00 prefixes don't matter."""
    digits = re.sub(r'\D', '', phone or '')
    return digits[-10:] if len(digits) >= 10 else digits


def score_pair(a, b):
    """Best-matching signal between two guests: (score, reason)."""
    if a.email and b.email and normalise_email(a.email) == normalise_email(b.email):
        return SCORE_EMAIL, 'email'

    if a.phone and b.phone and normalise_phone(a.phone) == normalise_phone(b.phone):
        return SCORE_PHONE, 'phone'

    a_name = normalise_text(f'{a.first_name} {a.last_name}')
    b_name = normalise_text(f'{b.first_name} {b.last_name}')
    if a_name and b_name and a_name == b_name:
        return SCORE_NAME, 'name'

    a_address = normalise_text(a.address)
    b_address = normalise_text(b.address)
    a_last = normalise_text(a.last_name)
    b_last = normalise_text(b.last_name)
    if a_last and b_address and a_last == b_last and a_address == b_address:
        return SCORE_NAME_ADDRESS, 'name+address'

    return 0.0, None


def _completeness(guest):
    """More complete records are the better merge target (primary)."""
    score = 0
    if guest.email:
        score += 2
    if guest.phone:
        score += 2
    if guest.address:
        score += 1
    if guest.rsvp_status and guest.rsvp_status.name.lower() == 'confirmed':
        score += 2
    return score


def find_duplicate_clusters(wedding, guests=None):
    """
    Cluster a wedding's guests into suspected duplicate groups.

    Returns a list of clusters:

    ``{cluster_id, guests: [...], suggested_primary: id, match_score, reason}``

    Only clusters with at least two guests are returned.
    """
    from .models import Guest
    from .serializers import GuestSerializer

    guests = guests if guests is not None else list(
        Guest.objects.filter(wedding=wedding).select_related('rsvp_status')
    )

    parent = {guest.id: guest.id for guest in guests}

    def find(node):
        while parent[node] != node:
            parent[node] = parent[parent[node]]
            node = parent[node]
        return node

    def union(left, right):
        left_root, right_root = find(left), find(right)
        if left_root != right_root:
            parent[right_root] = left_root

    # Union every pair that scores at or above the threshold.
    for i, guest_a in enumerate(guests):
        for guest_b in guests[i + 1:]:
            score, _reason = score_pair(guest_a, guest_b)
            if score >= DUPLICATE_THRESHOLD:
                union(guest_a.id, guest_b.id)

    # Group members by cluster root.
    clusters = {}
    for guest in guests:
        clusters.setdefault(find(guest.id), []).append(guest)

    results = []
    for index, members in enumerate(clusters.values(), start=1):
        if len(members) < 2:
            continue

        members.sort(key=_completeness, reverse=True)
        primary = members[0]
        # The cluster's score/reason is the strongest pair involving the
        # primary, so the merge suggestion carries a concrete explanation.
        best_score, best_reason = 0.0, None
        for other in members[1:]:
            score, reason = score_pair(primary, other)
            if score > best_score:
                best_score, best_reason = score, reason

        results.append({
            'cluster_id': index,
            'suggested_primary': primary.id,
            'match_score': best_score,
            'reason': best_reason,
            'guests': GuestSerializer(members, many=True).data,
        })

    # Strongest clusters first: those are the most obvious mistakes.
    results.sort(key=lambda cluster: cluster['match_score'], reverse=True)
    return results
