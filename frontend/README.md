# GodzillaCoder SupportDesk â€“ Frontend

React frontend for the **Support Ticket Management System** (COMP229 â€“ Web Application Development, Centennial College, team **GodzillaCoder**).

It connects to the existing Express/MongoDB backend (`Project A`) **without changing it**.

- React 19 + React Router 7 + Axios + plain CSS (built with Vite)
- JWT login (token saved in `localStorage`, sent as `Authorization: Bearer <token>`)
- 6 pages: Login/Register, Dashboard, Create Ticket, My Tickets, Ticket Details, Admin Dashboard
- Responsive: desktop, tablet (slide-in menu), mobile (tables become cards)

## Run it (Windows + VS Code)

See **[../RUN_GUIDE.md](../RUN_GUIDE.md)** for the full guide. From the project root, `npm install` then `npm run dev` starts everything. To run the parts separately:

```powershell
# Terminal 1 â€“ backend
cd backend
npm install
npm start          # http://localhost:5000

# Terminal 2 â€“ frontend
cd frontend
npm install
npm run dev        # http://localhost:5173
```

## How it talks to the backend

During development, Vite forwards every `/api/...` request to `http://localhost:5000` (see `vite.config.js`).
If your backend uses another port, copy `.env.example` to `.env` and change `VITE_BACKEND_URL`.

| Page | Route | Backend calls |
|---|---|---|
| Login / Register | `/login`, `/register` | `POST /api/auth/login`, `POST /api/auth/register` |
| Dashboard | `/dashboard` | `GET /api/tickets` |
| Create Ticket | `/tickets/new` | `POST /api/tickets` |
| My Tickets | `/tickets` | `GET /api/tickets` |
| Ticket Details | `/tickets/:id` | `GET`, `PUT`, `DELETE /api/tickets/:id` |
| Admin Dashboard | `/admin` | `GET /api/tickets`, `GET /api/users`, `PUT/DELETE /api/tickets/:id`, `PUT/DELETE /api/users/:id` |
| Sign out | â€“ | `GET /api/auth/signout` (then the token is deleted) |

## Notes about the current backend

These are behaviours of `Project A`; the frontend works with them as they are.

1. `GET /api/tickets` returns **all** tickets. The frontend shows regular users only their own tickets (filtered by `createdBy`). Administrators see everything.
2. `GET /api/users` is allowed for any logged-in user. The Admin page is hidden from non-admins in the UI, but the API itself does not check the role. A one-line `if (req.user.role !== 'admin')` check in the backend would close this.
3. The registration form never sends a `role`, so new accounts are always `user`. The first admin is set up directly in MongoDB (see ../RUN_GUIDE.md, step 6).
4. Comments, categories and agent assignment are **not** supported by the backend, so they are not shown anywhere.

## Folder structure

```
src/
  api/          client.js (Axios + JWT), authApi.js, ticketApi.js, userApi.js
  context/      AuthContext.jsx (login state), ToastContext.jsx (pop-up messages)
  components/   Layout (sidebar + top bar), ProtectedRoute, Badges, Feedback, Icons
  pages/        LoginPage, DashboardPage, CreateTicketPage, MyTicketsPage,
                TicketDetailsPage, AdminDashboardPage, NotFoundPage
  styles/       app.css (blue / white / dark-grey theme, responsive rules)
  utils/        format.js (dates, short IDs, counts)
  assets/       GodzillaCoder logo images
```
