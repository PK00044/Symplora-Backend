# Employee Leave Management System

## Overview

This project is a **Leave Management System** built using **React (Vite)** for the frontend and **FastAPI** for the backend. It enables employees to apply for leaves, view their leave balance, and allows managers to approve or reject leave applications.

## Deployment Links

* **Backend (FastAPI + SQLite)** → [Render Deployment](https://symplora-backend-i3d1.onrender.com/docs)
* **Frontend (React + Vite)** → [Vercel Deployment](https://symplora-backend-m1irn6mel-pratham-kubsads-projects.vercel.app/)

## Features Implemented ✅

* Add new employees
* List all employees
* Apply for leaves (with warnings if balance is low)
* View leave balance per employee
* List all leave applications
* Approve/Reject leave requests

## Future Enhancements 🚀

* **Authentication & Roles** → Secure login for employees and managers
* **Email Notifications** → Notify employees/managers on leave updates
* **Analytics Dashboard** → Track leave trends and employee availability
* **Scalable Database** → Currently uses **SQLite** for MVP, but can be migrated to **PostgreSQL** for production scalability
* **CI/CD Pipeline** → Automated testing and deployments

## Tech Stack ⚙️

* **Frontend** → React + Vite + Fetch API
* **Backend** → FastAPI (Python)
* **Database** → SQLite (for MVP)
* **Hosting** → Vercel (Frontend), Render (Backend)

## How to Run Locally

1. Clone the repo
2. Setup backend:

   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
3. Setup frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Visit `http://localhost:5173` to access the app.

---

This project demonstrates a **scalable MVP** approach where SQLite was chosen for simplicity in the prototype phase, with clear pathways to migrate to PostgreSQL and add advanced features.
