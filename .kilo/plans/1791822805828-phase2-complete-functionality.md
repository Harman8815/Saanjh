# Phase 2 — Complete Existing Functionality

## Overview
Connect all frontend mock data to real backend APIs, implement missing features, and complete end-to-end flows.

## Current State Analysis

### Working (API Connected)
- Venue catalog listing & filtering (`VenueService.getVenueCatalog()`)
- Wedding card list page (`/wedding-cards`) - loads user's cards from API
- Guest management service (full CRUD + RSVP + invitations)

### Mock Data / Incomplete
| Feature | Current State | Target |
|---------|--------------|--------|
| Venue map search | ❌ None | Add map-based venue search with location filtering |
| Saved venues | ❌ None | Add "Save Venue" to user profile/wedding |
| Venue comparison | ❌ None | Side-by-side venue comparison modal |
| Wedding card detail (`/wedding-cards/[id]`) | 🟡 Mock data for card, guests, analytics | Connect to `WeddingCardService` APIs |
| Invitation preview (`/invitation-preview/*`) | 🟡 Hardcoded `websiteData` | Load from wedding card API |
| Public invitation (`/invite/[uid]`) | 🟡 `fetchInvitationData` returns mock | Connect to `WeddingCardService.getPublicWeddingCard()` |
| Public RSVP submission | ❌ None | POST to guest RSVP endpoint |
| Invitation analytics | 🟡 Mock numbers | Connect to `WeddingCardService.getWeddingCardAnalytics()` |
| PDF generation | ❌ Button only | Generate PDF from card data |
| Sharing links / QR codes | 🟡 Mock link display | Generate real `shareable_link` + QR code |
| Email invitations | ❌ Button only | Call `WeddingCardService.sendInvitationEmails()` |

### Backend Gap
The current `backend/server.js` only serves the proposal generator. The frontend expects a Django REST API at `http://localhost:8000/api` with endpoints matching `WeddingCardService`, `GuestService`, `VenueService`, etc.

---

## Phase 2 Task Breakdown

### 1. Venue Enhancements
- [x] **1.1 Venue Map Search** — Add Mapbox/Leaflet map to venues page; filter by radius from user location
- [x] **1.2 Saved Venues** — Add "Save" button on venue cards; store in user profile/wedding; show in dashboard
- [x] **1.3 Venue Comparison** — Multi-select venues → open comparison modal with side-by-side specs

### 2. Wedding Card Detail Page (`/wedding-cards/[id]`)
- [x] **2.1 Load Card Data** — Replace mock `cardData` with `WeddingCardService.getWeddingCard(id)`
- [x] **2.2 Load Guests** — Replace mock guests with `WeddingCardService.getWeddingCardGuests(cardId)`
- [x] **2.3 Load Analytics** — Replace mock analytics with `WeddingCardService.getWeddingCardAnalytics(cardId)`
- [x] **2.4 Persist Edits** — Wire "Save" to `WeddingCardService.updateWeddingCard(cardId, data)`
- [x] **2.5 Guest Management** — Connect add/edit/delete guest modals to API
- [x] **2.6 Photo Upload** — Implement `uploadGuestPhoto` for guest photos
- [x] **2.7 Export/Share** — Wire copy link, QR generation, email/SMS share, PDF download

### 3. Invitation Preview Pages (`/invitation-preview/*`)
- [x] **3.1 Website Preview** — Load card data via `WeddingCardService.getWeddingCard(id)` instead of `websiteData`
- [ ] **3.2 Image Preview** — Same, for image-based invitation
- [ ] **3.3 Template Sync** — Ensure preview templates match editor templates

### 4. Public Invitation & RSVP Flow (`/invite/[uid]`)
- [x] **4.1 Replace Mock Fetch** — Use `WeddingCardService.getPublicWeddingCard(shareableLink)` 
- [x] **4.2 RSVP Form** — Add RSVP section to public page (attending/declined + meal choice + guests)
- [x] **4.3 Submit RSVP** — POST to `GuestService` RSVP endpoint or `WeddingCardGuest` update
- [x] **4.4 Confirmation** — Show confirmation toast/email; update UI optimistically
- [x] **4.5 Guest Photo Upload** — Allow guests to upload photos via `uploadPublicGuestPhoto`

### 5. Invitation Analytics Verification
- [x] **5.1 Dashboard Analytics** — Display real `total_views`, `unique_guests`, `photos_uploaded` from API
- [x] **5.2 View Tracking** — Ensure public page view increments `total_views` (middleware or API call)
- [x] **5.3 Unique Guest Tracking** — Track via session/cookie or authenticated guest

### 6. PDF, Sharing, QR Codes
- [x] **6.1 PDF Generation** — Server-side PDF (pdfkit/puppeteer) or client-side (jspdf/html2canvas)
- [x] **6.2 Shareable Link** — Use `shareable_link` from API; regenerate via `generateShareableLink`
- [x] **6.3 QR Code** — Generate QR for `shareable_link` (qrcode.react or server-side)
- [x] **6.4 Social Share** — Open native share dialog / fallback to copy link

### 7. Email Invitation Delivery
- [x] **7.1 Send Invitations** — Wire "Send Invitations" button to `WeddingCardService.sendInvitationEmails(cardId)`
- [x] **7.2 Send Reminders** — Wire "Send Reminders" to `sendReminderEmails`
- [ ] **7.3 Status Tracking** — Show sent/failed status per guest; retry failed
- [ ] **7.4 Email Templates** — Verify backend sends styled HTML emails matching card design

---

## Dependencies & Ordering

```
Backend API (Django) ──► Frontend Services ──► Pages
       │                      │
       │                      ├─► 1. Venue enhancements (independent)
       │                      ├─► 2. Wedding card detail (needs backend)
       │                      ├─► 3. Invitation preview (needs 2)
       │                      ├─► 4. Public RSVP (needs backend guest RSVP)
       │                      ├─► 5. Analytics (needs backend tracking)
       │                      ├─► 6. PDF/QR/Share (needs card data)
       │                      └─► 7. Email (needs backend email config)
```

**Critical Path**: Backend API must exist before frontend integration tasks (2, 3, 4, 5, 7).

---

## Open Questions

1. **Backend Implementation**: Is the Django REST API already implemented elsewhere, or does it need to be built? The frontend services expect endpoints like `/wedding-cards/`, `/guests/`, `/weddings/venue-catalog/`.

2. **Authentication**: The API client uses HttpOnly cookies + CSRF. Does the Django backend already handle auth, or do we need to add login/register flows?

3. **Map Provider**: Mapbox (requires token) vs Leaflet + OpenStreetMap (free)? Recommend Leaflet for zero-config.

4. **PDF Generation**: Client-side (jspdf) vs server-side (Django + WeasyPrint/pdfkit)? Server-side ensures consistent rendering.

5. **Email Service**: What email backend? (SendGrid, Mailgun, SMTP, console). Need config for production.

6. **Real-time Updates**: Should analytics/views update via WebSocket/polling, or is page refresh sufficient?

---

## Validation Checklist

After each task, verify:
- [x] TypeScript compiles (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Feature works end-to-end in browser
- [ ] API calls visible in Network tab (no mock data)
- [x] Error states handled (loading, empty, 404, 500)
- [ ] Responsive on mobile

---

## Out of Scope (Phase 3+)
- Multi-language/i18n for invitations
- Advanced seating chart drag-and-drop
- Vendor marketplace integration
- Payment processing for vendors
- Mobile app / PWA

---

## Completion Notes

Checked items are implemented and verified via `npm run build`, `python manage.py check`,
and the backend tests that cover them. Deferred items and deviations:

- **3.2 Image Preview** — `/invitation-preview/image` still uses static content; only the
  website preview route was converted to a real card-backed dynamic route.
- **3.3 Template Sync** — Preview templates now render the card's color, names and
  details, but they are separate components from the invitation-builder editor templates.
- **4.2 RSVP Form** — Implemented with attending/declined, plus-one guest, dietary
  restrictions and notes. There is no meal-choice dropdown because the backend card-guest
  model has no meal field.
- **4.4 Confirmation** — Shows a toast plus an in-page confirmation state; no confirmation
  email is sent on submit.
- **5.1 Dashboard Analytics** — Real analytics render on the card detail page and as
  per-card badges in the card list, not on the `/dashboard` home page.
- **7.3 Status Tracking** — The API returns per-guest `sent`/`failed` lists, but the UI
  only shows a summary toast; there is no per-guest status table or retry action.
- **7.4 Email Templates** — The backend sends plain-text emails. No styled HTML matching
  the card design.
- **Lint** — `npm run lint` reports pre-existing errors/warnings across the repo
  (467 problems) unrelated to this work.
- **Browser verification** — Not performed in a real browser; API wiring and loading,
  empty, and 404 states were verified by build and backend tests only.