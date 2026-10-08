# Happy Nest PG Management — Frontend (Phase 1)

Mobile-first React app for managing a real monthly-stay PG.  
Runs entirely on **mock data** — no Spring Boot / PostgreSQL required yet.

**Project location:** `C:\Users\duggi\happy-nest-pg`

---

## Open in VS Code

1. Open VS Code
2. **File → Open Folder…**
3. Select: `C:\Users\duggi\happy-nest-pg`
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
| `/payments` | Payments |
| `/transfers` | Transfer history |
| `/profile` | Admin profile UI |

---

## Building model

- Floors: **1, 2, 3, 4, 5** (100–500 series; not 200–600)
- 12 rooms per floor → **60 rooms**
- Per floor: 10×2-bed + 1×3-bed + 1×1-bed → **24 beds/floor** → **120 beds**
- Room numbers: `101–112`, `201–212`, … `501–512`
- Room types: `x01` single (1 bed), `x02–x11` double sharing (2 beds), `x12` triple sharing (3 beds; up to 3 residents, or **2-only** option where Bed C is not used and room is **full at 2**)

Defined in `src/data/buildingConfig.js` — UI calculates totals from this.

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

## Phase 1 scope

Included: dashboard, residents, rooms (building → floor → room → bed), transfers, monthly payment recording (Cash / PhonePe), search, admin profile UI, mock data, service layer.

Not included: login/auth, Spring Boot, database, payment gateway, expenses, AI, daily/15-day stays.
