# GodzillaCoder SupportDesk

**COMP229 — Web Application Development | Centennial College**  
**Project Part 1 — Support Ticket Management System**

A full-stack support ticket application for submitting, tracking, editing, and resolving support requests. Users can register, log in, submit tickets, and track their progress. The application also includes an administrator interface for managing tickets and users.

> **Project status:** Coursework first release. The React frontend and Express/MongoDB backend have been integrated. Core ticket CRUD was manually tested. Server-side access restrictions still need improvement before public deployment.

## Features

- **Account registration and login:** JWT-based authentication with hashed passwords.
- **User dashboard:** Ticket totals, status summaries, and recent tickets.
- **Ticket CRUD:** Create, list, view, edit, and delete tickets.
- **Ticket fields:** Title, description, priority (`Low`, `Medium`, `High`) and status (`Open`, `In Progress`, `Resolved`).
- **Ticket search and filtering:** Find requests and filter by status.
- **Admin interface:** View and manage users and tickets, including status changes and account roles.
- **Responsive React UI:** Desktop and smaller-screen layouts.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, React Router, Vite, Axios, CSS |
| Backend | Node.js, Express, MVC-style controllers/routes/models |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| Workflow | GitHub, feature branches, pull requests, Postman |

## Folder structure

```text
support-ticket-management-system/
├── backend/
│   ├── controllers/     # Business logic
│   ├── middleware/      # JWT middleware
│   ├── models/          # User and Ticket models
│   ├── routes/          # API routes
│   ├── server.js        # Database connection and Express server
│   ├── .env.example     # Safe configuration template
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── styles/
│   ├── vite.config.js
│   └── package.json
├── package.json         # Runs both frontend and backend
├── package-lock.json
└── README.md
```

## Local setup (Windows / PowerShell)

### Prerequisites

- Node.js and npm compatible with the included Vite version
- Git
- An accessible MongoDB Atlas development database and authorized credentials

### 1. Clone and install

```powershell
git clone https://github.com/varothayan8/support-ticket-management-system.git
cd support-ticket-management-system
npm install
```

The root `postinstall` script installs dependencies for both `backend/` and `frontend/`. If the repository is already cloned, use `git pull origin main` from inside the project instead of cloning again.

### 2. Configure MongoDB and JWT

```powershell
Copy-Item backend\.env.example backend\.env
```

Edit `backend/.env` **locally** with credentials supplied by the team database administrator:

```dotenv
PORT=5000
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<long random private secret>
```

**Do not upload or commit `.env`, database credentials, or JWT secrets.** The example file must contain placeholders only. Ensure your IP/network is allowed in MongoDB Atlas as appropriate.

### 3. Start the app

From the project root:

```powershell
npm run dev
```

- Frontend: <http://localhost:5173> (Vite may switch to 5174 when 5173 is in use)
- Backend: <http://localhost:5000>

Wait for `Connected to MongoDB Atlas` and `Server running on port 5000`. The backend starts listening only after connecting to the database. During development, Vite proxies `/api` to port 5000 by default (see `frontend/vite.config.js`).

### Troubleshooting

| Problem | What to check |
| --- | --- |
| Registration fails / Vite `/api` proxy error | Backend process and MongoDB connection must be running; starting only the frontend is insufficient. |
| `querySrv ECONNREFUSED` | Check DNS/SRV resolution, Atlas hostname, network, and Node.js DNS handling. |
| MongoDB authentication/timeout errors | Check Atlas credentials, cluster status, and network access with the database administrator. |
| Vite launches on 5174 | Another process uses port 5173; use the URL printed in the terminal. |

## API endpoints

Protected endpoints expect `Authorization: Bearer <JWT>`.

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a new regular user |
| POST | `/api/auth/login` | Authenticate and receive a token |
| GET | `/api/auth/signout` | Sign-out response (client removes token) |
| GET | `/api/tickets` | List tickets |
| POST | `/api/tickets` | Create a ticket |
| GET | `/api/tickets/:id` | Retrieve ticket details |
| PUT | `/api/tickets/:id` | Update a ticket |
| DELETE | `/api/tickets/:id` | Delete a ticket |
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | Retrieve a user |
| PUT | `/api/users/:id` | Update a user |
| DELETE | `/api/users/:id` | Delete a user |

Registration always gives new accounts the `user` role regardless of a supplied role field. The first administrator must be provisioned through an authorized database setup process; public registration must not grant admin access.

## Testing and known limitations

**Manual integration checks reported/completed in November 2026:**

- Registered/logged in and accessed the user dashboard locally.
- Created a test support ticket; confirmed it appeared in **My Tickets**.
- Opened ticket details, edited the ticket, and deleted it successfully.

**Remaining testing and security work:**

- Test admin actions and negative authorization scenarios independently.
- Current backend allows authenticated users to retrieve all tickets, individual ticket details, and user listings. Filtering only in the frontend is **not** secure; enforce owner/admin permissions in the backend before public deployment.
- Automated backend tests are not yet configured (`backend/package.json` contains a placeholder test command).
- The application is a course first release and has not been verified as production-ready.

## Team collaboration and contributions

This repository is the collaborative codebase for the **GodzillaCoder** COMP229 project.

| Contribution | GitHub account / evidence |
| --- | --- |
| GitHub repository setup and integration coordination | [varothayan8](https://github.com/varothayan8) |
| Backend implementation | [ValhallaES](https://github.com/ValhallaES) — [PR #1](https://github.com/varothayan8/support-ticket-management-system/pull/1) |
| Frontend implementation | [Lim-Chhay-Khy](https://github.com/Lim-Chhay-Khy) — [PR #3](https://github.com/varothayan8/support-ticket-management-system/pull/3) |
| Backend architecture & DB | [abhjeetsingh000-ship-it](https://github.com/abhjeetsingh000-ship-it) |
| Other team members and roles | Confirm against the signed team contract and [commit history](https://github.com/varothayan8/support-ticket-management-system/commits/main) |

Team members should make their own meaningful commits, work on feature branches, and submit pull requests for review. The assignment requires commits from **every team member**.

---

**Course:** COMP229 — Web Application Development  
**Institution:** Centennial College  
**Project:** Support Ticket Management System — Part 1 / First Release
