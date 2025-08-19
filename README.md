# Symplora

Symplora is a minimal yet scalable system designed as an MVP with a React + Vite frontend and a FastAPI backend. It uses SQLite for simplicity in MVP, with scope to migrate to PostgreSQL for scalability. The project is deployed on **Vercel** (frontend) and **Render** (backend).

---

## 🚀 Live Links

* **Backend (FastAPI Docs)**: [Render Deployment](https://symplora-backend-i3d1.onrender.com/docs)
* **Frontend (React + Vite on Vercel)**: [Vercel Deployment](https://symplora-backend-m1irn6mel-pratham-kubsads-projects.vercel.app/)

---

## ⚡ Setup Steps

1. Clone the repository:

   ```bash
   git clone <repo_url>
   cd symplora
   ```
2. Install backend dependencies:

   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
3. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📌 Assumptions

* MVP uses **SQLite** for lightweight storage.
* API endpoints are exposed for core functionality (CRUD, auth, etc.).
* Deployment targets are **Vercel** (frontend) and **Render** (backend).

---

## ✅ Edge Cases Handled

* Invalid API inputs handled with **FastAPI validation**.
* Empty states in frontend UI.
* Basic error handling for failed network/API requests.

---

## 🔮 Potential Improvements

* Migrate DB from **SQLite → PostgreSQL** for scalability.
* Add **authentication & role-based access**.
* Implement **caching** for frequent queries.
* Add **CI/CD pipeline** for automated deployment.
* Enhance frontend with better UI/UX and analytics.

---

## 🏗️ High Level System Design

### Architecture Diagram

```
        ┌───────────────┐        ┌───────────────┐
        │   Frontend    │        │   Backend     │
        │ (React + Vite)│ <----> │ (FastAPI)     │
        │   (Vercel)    │        │   (Render)    │
        └───────────────┘        └───────┬───────┘
                                          │
                                          ▼
                                 ┌────────────────┐
                                 │   Database     │
                                 │   (SQLite →    │
                                 │   PostgreSQL)  │
                                 └────────────────┘
```

### API & DB Interaction

* Frontend calls backend APIs using REST.
* Backend validates requests, processes business logic.
* Database (SQLite for MVP, PostgreSQL for scaling) stores and retrieves data.

### Scaling Strategy

* Move from SQLite to **PostgreSQL** for better concurrency & scaling.
* Containerize with **Docker + Kubernetes** for microservice scaling.
* Deploy load balancers to distribute requests.
* Caching layer (e.g., Redis) to reduce DB load.

---

## 📈 Growth Handling

If company grows from **50 → 500 employees**:

* DB migration to **PostgreSQL**.
* Implement **API rate limiting**.
* Introduce **horizontal scaling** for backend (multiple server instances).
* Scale frontend with **CDN** and edge caching.

---

## High‑Level System Design (HLD)

### Architecture (Frontend • Backend • Database)

```
[User Browser]
     │
     │  HTTPS (fetch)
     ▼
React + Vite (Vercel)
     │  calls REST APIs
     ▼
FastAPI app (Render)
  ├─ CORS middleware
  ├─ SQLAlchemy ORM
  └─ Validation & business rules
     │
     │  SQL (via SQLAlchemy)
     ▼
SQLite (MVP) → PostgreSQL (scaling)
```

* **Frontend**: React (Vite) deployed on **Vercel**; reads `VITE_API_URL` and calls REST endpoints.
* **Backend**: FastAPI on **Render** with CORS for the Vercel domain. Business rules enforce edge cases (dates, overlaps, balances, etc.).
* **Database**: **SQLite** for MVP simplicity; **PostgreSQL** recommended for 50→500 employees (concurrency, indexing, migrations).

### API ⇄ DB Interaction Flow

**Example: Apply Leave**

1. `POST /leaves/apply/` from client.
2. FastAPI validates payload → loads employee.
3. Checks: joining date, date order, overlap (`leaves` for same employee and intersecting dates), and balance.
4. On success: create `LeaveRequest` (status `Pending`), commit.
5. Respond with `LeaveOut` including embedded `employee` mini‑profile.

**List/Review**

* `GET /employees/` and `GET /leaves/` use SQLAlchemy; `joinedload` for eager employee data to avoid N+1.
* `POST /leaves/{id}/Approved|Rejected` updates status and (if approved) decrements balance atomically in one transaction.

### Scaling plan: 50 → 500 employees

**Data layer**

* Migrate **SQLite → PostgreSQL**.
* Add indexes:

  * `employees.email` (unique),
  * `leaves.employee_id`,
  * `(employee_id, start_date, end_date)` for range queries.
* (PostgreSQL) optional **exclusion constraint** on a `daterange` to prevent overlaps at DB level.
* Use migrations (Alembic) and connection pooling.

**App layer**

* Run FastAPI with **Uvicorn/Gunicorn** multiple workers; enable autoscaling on Render.
* Add **pagination** to list endpoints.
* Introduce **rate limiting** and **request/response caching** for read‑heavy endpoints (e.g., Redis).
* Background tasks/queue (e.g., RQ/Celery) for email notifications on approve/reject.

