# Deploy Happy Nest (you + father can use anytime)

You need **two** hosted pieces:

1. **Frontend** → Vercel (the app link you open)
2. **Backend + PostgreSQL** → Render (saves all data)

---

## A. Deploy backend on Render (do this first)

1. Create a free account at https://render.com
2. Push `happy-nest-pg-backend` to GitHub (or use Render “Deploy from local / Blueprint”)
3. In Render: **New → Blueprint** → select the backend repo (uses `render.yaml`)
   - Or manually:
     - **New → PostgreSQL** (free) → name `happy-nest-db`
     - **New → Web Service** → Docker → root = backend folder
4. Set env vars on the Web Service:
   - `SPRING_PROFILES_ACTIVE` = `prod`
   - `DATABASE_URL` = (from Render Postgres → **Internal Database URL**)
   - `APP_AUTH_USERNAME` = `admin`
   - `APP_AUTH_PASSWORD` = `happynest@602`
   - `APP_CORS_ALLOWED_ORIGINS` = your Vercel URL later (e.g. `https://happy-nest-pg-frontend.vercel.app`)
5. Deploy. Wait until status is **Live**.
6. Copy the service URL, e.g. `https://happy-nest-pg-api.onrender.com`
7. Test: `https://YOUR-API.onrender.com/api/health` → `{"status":"ok"}`

> Free Render websites **sleep** after ~15 minutes idle. First open can take 30–60 seconds.

---

## B. Deploy frontend on Vercel

1. Create account at https://vercel.com
2. Import the `happy-nest-pg-frontend` frontend repo (or deploy with CLI)
3. **Environment Variables** (Production):

| Name | Value |
|------|--------|
| `VITE_USE_MOCK` | `false` |
| `VITE_API_BASE_URL` | `https://YOUR-API.onrender.com/api` |
| `VITE_AUTH_USERNAME` | `admin` |
| `VITE_AUTH_PASSWORD` | `happynest@602` |
| `VITE_AUTH_ADMIN_NAME` | `Admin` |

4. Deploy → you get a link like `https://happy-nest-pg-frontend.vercel.app`
5. Go back to Render and set `APP_CORS_ALLOWED_ORIGINS` to that Vercel URL, then redeploy API.

---

## C. Use the app

1. Open the **Vercel link** on phone or laptop
2. Login:
   - Username: `admin`
   - Password: `happynest@602`
3. Add residents, mark payments, etc. — data is stored in PostgreSQL

Share the same Vercel link with your father.

---

## Local reminder

Do **not** commit `.env` (passwords). Keep secrets only in Vercel/Render dashboards.
