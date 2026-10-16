"""
Seating plan helpers: capacity checks and the auto-assign algorithm.

Every assignment path (single, bulk, auto) applies the same two guards:
a table never exceeds its own capacity, and the wedding never seats more
guests than the venue's maximum capacity.
"""


def table_remaining_capacity(table):
    """Free seats on a table, never negative."""
    return max(table.capacity - table.assigned_guests.count(), 0)


def venue_capacity(wedding):
    """The venue's capacity_max, or None when no venue is chosen."""
    catalog = None
    if wedding.venue_catalog_id:
        catalog = wedding.venue_catalog
    elif wedding.venue_id and wedding.venue.venue_catalog_id:
        catalog = wedding.venue.venue_catalog
    if not catalog:
        return None
    return catalog.capacity_max


def total_free_venue_seats(wedding, tables):
    """Seats left within the venue limit minus what is already seated."""
    capacity = venue_capacity(wedding)
    if capacity is None:
        return None
    seated = sum(table.assigned_guests.count() for table in tables)
    return max(capacity - seated, 0)


def auto_assign_seats(wedding):
    """
    Greedy largest-group-first seating fill.

    Groups are seated together where a table has room for the whole group;
    spillover goes to the next table. Ungrouped guests fill the remainder.
    Guests that cannot be seated without breaking a capacity limit stay
    unassigned and are reported, so nothing is silently dropped.

    Returns ``{'assigned': int, 'unassigned': int, 'unassignable': [ids]}``.
    """
    from collections import defaultdict

    from .models import Guest

    tables = list(wedding.tables.order_by('table_number'))
    if not tables:
        return {'assigned': 0, 'unassigned': 0, 'unassignable': []}

    unassigned = list(
        Guest.objects.filter(wedding=wedding, table__isnull=True)
        .select_related('group', 'rsvp_status')
    )

    # Largest groups first so their members get seated together; ungrouped
    # guests come last (treated as groups of one).
    groups = defaultdict(list)
    for guest in unassigned:
        groups[guest.group_id].append(guest)
    ordered_groups = sorted(
        groups.values(),
        key=lambda members: (members[0].group_id is None, -len(members)),
    )

    venue_seats = total_free_venue_seats(wedding, tables)
    assigned_count = 0
    unassignable = []

    for members in ordered_groups:
        for guest in members:
            if venue_seats is not None and venue_seats <= 0:
                unassignable.append(guest.id)
                continue

            target = next(
                (table for table in tables if table_remaining_capacity(table) > 0),
                None,
            )
            if target is None:
                unassignable.append(guest.id)
                continue

            guest.table = target
            # save() rather than update() so Guest.save() runs.
            guest.save()
            assigned_count += 1
            if venue_seats is not None:
                venue_seats -= 1

    return {
        'assigned': assigned_count,
        'unassigned': len(unassigned) - assigned_count,
        'unassignable': unassignable,
    }
