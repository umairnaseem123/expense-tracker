# FinTrack: Personal Finance & Expense Management

A full-stack finance web app to track income and expenses, set monthly category budgets, and understand spending through charts and reports. Built with React, Node.js, Express and MongoDB.

## Live Demo

- **Frontend:** https://expense-tracker-v4qy.vercel.app
- **Backend API:** https://expense-tracker-one-eta-16.vercel.app
- **GitHub:** https://github.com/umairnaseem123/expense-tracker

## Screenshots

| Landing | Dashboard |
|---|---|
| ![Landing](screenshots/landing.png) | ![Dashboard](screenshots/dashboard.png) |

| Transactions | Budgets |
|---|---|
| ![Transactions](screenshots/transactions.png) | ![Budgets](screenshots/budgets.png) |

| Reports | Mobile |
|---|---|
| ![Reports](screenshots/reports.png) | ![Mobile](screenshots/mobile.png) |

## Features

**Authentication**
- Register and login with JWT
- Protected routes; every user sees only their own data

**Transactions**
- Add, edit and delete income and expenses (title, amount, category, date, notes)
- Search by title, filter by type, category and date range
- Sort by newest, oldest, highest or lowest amount
- View-details modal and delete confirmation
- Form validation, loading states and success/error toasts

**Dashboard**
- Summary cards: total income, total expenses, current balance, saved this month
- Month-over-month percentage change calculated from real data
- Spending-by-category donut chart and monthly income vs expense chart
- Recent transactions list

**Budgets**
- Create, edit and delete a monthly budget per category
- Spending is tracked automatically from your transactions
- Progress bar with warning states at 70%, 80%, 90% and 100% (exceeded)

**Reports**
- Pick any month or all time
- Total income, expenses and balance
- Category breakdown with percentage share
- Export the report as CSV

**UI/UX**
- Landing page, sidebar layout and top bar
- Fully responsive (desktop, tablet, mobile) with collapsible navigation
- Empty states and loading skeletons

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Recharts, Axios, lucide-react |
| Backend | Node.js, Express |
| Database | MongoDB Atlas with Mongoose |
| Auth | JWT, bcryptjs |
| Deployment | Vercel (frontend and backend) |

## Project Structure

```
expense-tracker/
├── backend/
│   ├── config/          # database connection
│   ├── controllers/     # auth, transactions, budgets
│   ├── middleware/      # JWT protection
│   ├── models/          # User, Transaction, Budget
│   ├── routes/
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # Layout, Modal, Toast, Charts, forms
        ├── context/     # AuthContext
        ├── pages/       # Landing, Auth, Dashboard, Transactions, Budgets, Reports
        └── api.js       # Axios instance with token interceptor
```

## API Endpoints

All routes except register and login require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Login and receive a token |
| GET | `/api/transactions` | List transactions (optional filters) |
| POST | `/api/transactions` | Add a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/transactions/summary` | Totals, category breakdown, monthly data |
| GET | `/api/budgets` | List budgets with current-month spending |
| POST | `/api/budgets` | Create a budget |
| PUT | `/api/budgets/:id` | Update a budget |
| DELETE | `/api/budgets/:id` | Delete a budget |

## Run Locally

**Prerequisites:** Node.js 18+ and a MongoDB Atlas connection string.

```bash
git clone https://github.com/umairnaseem123/expense-tracker.git
cd expense-tracker
```

**Backend**

```bash
cd backend
npm install
cp .env.example .env     # then fill in your values
npm run dev
```

`backend/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Optional `frontend/.env` (defaults to `http://localhost:5000/api`):

```
VITE_API_URL=http://localhost:5000/api
```

Open http://localhost:5173.

## Deployment

Both apps are deployed on Vercel as two separate projects from this repository.

- **Backend** (root directory `backend`): set `MONGO_URI` and `JWT_SECRET`. In MongoDB Atlas, allow network access from `0.0.0.0/0`.
- **Frontend** (root directory `frontend`): set `VITE_API_URL` to `<backend-url>/api`, then redeploy.

## Task Workflow Coverage

1. **Design dashboard screens:** landing page, auth pages, dashboard, transactions, budgets, reports
2. **Expense management APIs:** REST endpoints for transactions and budgets
3. **Store financial records in a database:** MongoDB Atlas with Mongoose models
4. **Display reports and summaries:** dashboard charts, summary cards, monthly reports with CSV export
5. **Implement authentication:** JWT-based register/login with protected routes and per-user data

## Roadmap

- Savings goals
- Notifications
- Profile and password settings
- PDF export for reports

## Author

**Umair Naseem** — Full-stack developer, built during the Auspify internship.