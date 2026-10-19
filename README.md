# UPS Battery Store

Production-oriented MERN e-commerce starter for UPS systems, replacement batteries, surge protection, inverters and power accessories.

## Prerequisites

- Node.js 20+
- MongoDB 7+ running locally or a hosted MongoDB URI
- npm 10+

## Install and run

```powershell
cd backend
Copy-Item config/.env.example config/.env
npm install
npm run seed
npm run dev
```

In another terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

The API runs on `http://localhost:5000` and the Vite app on `http://localhost:5173`.

## Firebase Authentication

Enable Email/Password in Firebase Authentication, copy the Firebase web app values into `frontend/.env`, and set `GOOGLE_APPLICATION_CREDENTIALS` in `backend/config/.env` to a downloaded Firebase Admin service-account JSON file. The frontend handles registration, login, password reset, token refresh, and password changes through Firebase. The backend verifies Firebase ID tokens and stores the application profile in MongoDB through `POST /api/v1/users/sync`.

## Admin access

Register a user, then promote the account in MongoDB:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

After promoting the user, sign out and sign in again so the updated profile is loaded in the frontend. Open `/dashboard` to access the admin area. Non-authenticated users are redirected to login, and authenticated users without the `admin` role are redirected to the storefront.

### Local test accounts

The configured admin account is:

| Account | Email | Password |
|---|---|---|
| Admin | `admin@upsstore.test` | Use `ADMIN_PASSWORD` from `backend/config/.env` |

Passwords are managed by Firebase Authentication and are intentionally not written in this README. Regular user accounts are created through `/register`; their passwords cannot be read from MongoDB.

### User management

The admin dashboard provides user CRUD actions through the **Users** tab:

- View all registered users and their roles.
- Edit a user's name, email, or role.
- Delete a user.

The corresponding API endpoints are:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/admin/users` | List users |
| GET | `/api/v1/admin/user/:id` | View one user |
| PUT | `/api/v1/admin/user/:id` | Update user details or role |
| DELETE | `/api/v1/admin/user/:id` | Delete a user |

All user management endpoints require a valid Firebase ID token and the `admin` role. Do not store Firebase, MongoDB, Cloudinary, SMTP, or JWT credentials in this Markdown file; keep them in the local environment files.

## API table

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/users/sync` | Firebase user |
| GET | `/api/v1/products` | Public |
| GET | `/api/v1/product/:id` | Public |
| POST | `/api/v1/order/new` | User |
| GET | `/api/v1/orders/me` | User |
| GET | `/api/v1/me` | User |
| PUT | `/api/v1/me/update` | User |
| GET | `/api/v1/admin/users` | Admin |
| GET/PUT/DELETE | `/api/v1/admin/user/:id` | Admin |
| POST | `/api/v1/admin/product/new` | Admin |
| GET/PUT/DELETE | `/api/v1/admin/product/:id` | Admin |
| GET | `/api/v1/admin/products` | Admin |
| GET/PUT/DELETE | `/api/v1/admin/order/:id` | Admin |
| GET | `/api/v1/admin/total-orders` | Admin |
| GET | `/api/v1/admin/total-sales` | Admin |
| GET | `/api/v1/admin/customer-sales` | Admin |
| GET | `/api/v1/admin/sales-per-month` | Admin |
| GET | `/api/v1/admin/product-sales` | Admin |

## Screenshot placeholders

- `[storefront screenshot]`
- `[product detail and runtime calculator screenshot]`
- `[admin dashboard screenshot]`
