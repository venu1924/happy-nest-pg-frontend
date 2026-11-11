# Happy Nest PG Management — Frontend

Mobile-first React app for a real PG. The live site talks to the Spring Boot API. Local mock mode is only for development.

**Live app:** https://happy-nest-pg-frontend.vercel.app  
**Project folder:** `C:\Users\duggi\happy-nest-pg-frontend`

---

## Open in VS Code

1. Open VS Code
2. **File → Open Folder…**
3. Select: `C:\Users\duggi\happy-nest-pg-frontend`
4. Open the integrated terminal (`Ctrl + `` `)
5. Run:

```bash
npm install
npm run dev
```

6. Open the URL shown (usually `http://localhost:5173`)

Other scripts:

```bash
npm run build    # production build
npm run preview  # preview production build
```

---

## Stack

- React 18 + Vite + JavaScript
- Tailwind CSS
- React Router
- Axios (ready for Spring Boot)
- lucide-react

---

## Project structure

```
happy-nest-pg/
├── .env                          # VITE_USE_MOCK, VITE_API_BASE_URL
├── .env.example
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
└── src/
    ├── assets/
    │   └── logo.png              # Happy Nest logo (navbar)
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── routes/
    │   └── AppRoutes.jsx
    ├── context/
    │   └── AppContext.jsx        # App-wide state + services
    ├── data/
    │   ├── buildingConfig.js     # Floors 1–5 (100–500 series), room types
    │   ├── generateMockData.js
    │   ├── mockStore.js          # In-memory store (mutations)
    │   ├── mockFloors.js
    │   ├── mockRooms.js
    │   ├── mockResidents.js
    │   └── mockPayments.js
    ├── services/                 # ← swap mock → Axios here later
    │   ├── api.js                # Axios instance + USE_MOCK flag
    │   ├── residentService.js
    │   ├── roomService.js
    │   ├── paymentService.js
    │   ├── transferService.js
    │   └── dashboardService.js
    ├── hooks/
    │   ├── useResidents.js
    │   ├── useRooms.js
    │   └── usePayments.js
    ├── utils/
    │   ├── roomUtils.js
    │   ├── paymentUtils.js
    │   └── formatters.js
    ├── components/
    │   ├── layout/
    │   │   ├── AppLayout.jsx
    │   │   ├── Navbar.jsx
    │   │   └── AdminProfileMenu.jsx
    │   ├── common/
    │   │   ├── SearchBar.jsx
    │   │   ├── StatusBadge.jsx
    │   │   ├── ConfirmDialog.jsx
    │   │   ├── EmptyState.jsx
    │   │   ├── LoadingState.jsx
    │   │   └── ErrorState.jsx
    │   ├── dashboard/
    │   │   ├── DashboardCard.jsx
    │   │   ├── PaymentSummary.jsx
    │   │   ├── QuickActions.jsx
    │   │   └── AlertsList.jsx
    │   ├── rooms/
    │   │   ├── BuildingView.jsx  # Signature building UI
    │   │   ├── FloorBlock.jsx
    │   │   ├── FloorRoomGrid.jsx
    │   │   ├── RoomCard.jsx
    │   │   └── BedCard.jsx
    │   ├── residents/
    │   │   ├── ResidentCard.jsx
    │   │   ├── ResidentForm.jsx
    │   │   └── TransferForm.jsx
    │   └── payments/
    │       └── PaymentCard.jsx
    └── pages/
        ├── Dashboard.jsx
        ├── Residents.jsx
        ├── PastResidents.jsx
        ├── ResidentDetails.jsx
        ├── AddResident.jsx
        ├── EditResident.jsx
        ├── Rooms.jsx
        ├── FloorView.jsx
        ├── RoomDetails.jsx
        ├── TransferResident.jsx
        ├── Transfers.jsx
        ├── Payments.jsx
        └── Profile.jsx
```

---

## Routes (Phase 1 — no login)

| Path | Page |
|------|------|
| `/` | Dashboard |
| `/residents` | Residents list |
| `/residents/new` | Add resident |
| `/residents/:id` | Resident details |
| `/residents/:id/edit` | Edit resident |
| `/residents/:id/transfer` | Room transfer |
| `/residents/past` | Past residents |
| `/rooms` | Building view |
| `/rooms/floor/:floorNumber` | Floor view |
| `/rooms/:roomNumber` | Room details |
| `/payments` | Monthly payments, plus Paid (T) and Unpaid (T) |
| `/temporary` | Temporary (few-day) residents |
| `/temporary/new` | Add a temporary resident |
| `/temporary/:id` | Temporary stay details, payment, extend days |
| `/transfers` | Transfer history |
| `/profile` | Admin profile UI |
| `/assistant` | Ask questions about the saved PG data |

---

## Building model

- Floors: **1, 2, 3, 4, 5** (100–500 series; not 200–600)
- 12 rooms per floor → **60 rooms**
- Per floor: 10×2-bed + 1×3-bed + 1×1-bed → **24 beds/floor** → **120 beds**
- Room numbers: `101–112`, `201–212`, … `501–512`
- Room types: `x01` single (1 bed). `x02–x11` start as double sharing (2 beds) and can be given as **single** (both beds, one person) or **triple** (Bed C is added, up to 3 people). `x12` is triple sharing (up to 3, or **2-only** where Bed C is unused and the room is full at 2).
- Floor layout (same on every floor), for example the 400 series:

```
403          404
402          405
401          406
Sofa space   407
             408
412          409
411          410
```

- Room colors: green = monthly resident, blue = temporary stay. A mix is split (half green / half blue, or two green and one blue). An all-temporary room is fully blue.

Defined in `src/data/buildingConfig.js` and `src/components/rooms/FloorRoomGrid.jsx`.

---

## Residents, payments, temporary stays

- **Monthly residents** stay until deleted. Each month they appear again with that month’s rent **Pending**. Mark paid only in that month. A person whose joining date is in a future month (for example entered in late October to join in November) shows in the joining month, not earlier.
- **Refund amount** is a number you type (use `0` if nothing is returned). It is not a Refundable / Non-refundable switch.
- **Temporary residents** are few-day stays: name, phone, amount per day, joining date, number of days, and a free bed (single, double, or triple). They are not counted as monthly residents.
- Dashboard: **Residents** (monthly only), **Temporary residents**, **Vacant beds** (ignores temporary stays), **Vacant beds (P+T)** (counts both).
- Temporary countdown includes today: a 10-day stay shows **10 days left**, then **9 days left**, and **Vacate today** on the last day. Extra days can be added from the stay page.
- Monthly payment summary does not mix temporary money. Unpaid temporary stays are listed separately. Payment filters **Paid (T)** and **Unpaid (T)** are only for temporary stays.

---

## Connect Spring Boot later

1. In `.env`:

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8080/api
```

2. Replace mock branches inside `src/services/*` with Axios calls (UI stays the same).
3. Add `@CrossOrigin` on your Spring Boot controllers.

Expected conceptual endpoints:

- `GET/POST /api/residents`, `GET/PUT /api/residents/{id}`
- `GET /api/rooms`, `GET /api/rooms/{roomNumber}`
- `GET /api/payments`, `PUT /api/payments/{id}/mark-paid`
- `POST /api/residents/{id}/transfer`
- `GET /api/dashboard`

---

## What is included

Dashboard, login, monthly residents, temporary stays, rooms (building → floor → room → bed), transfers, monthly payment recording (Cash / UPI / Card), search, and admin profile.

Not included: a payment gateway, expenses, or AI. Money is collected outside the app; the app only records it.

Hosting notes are in `DEPLOY.md`. The live frontend is on Vercel. The API and database are on Render. A free Render Postgres database expires about 30 days after it is created.
