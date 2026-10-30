# Render Deployment Guide

This guide deploys the UPS Battery Store as two Render services:

1. **Backend**: Render Web Service running Express.
2. **Frontend**: Render Static Site running the Vite production build.

The backend and frontend must be deployed separately because the frontend is a
static Vite application while the backend is a Node/Express API.

The examples below use:

```text
Repository: Lexes14/ITCP18-REACT
Backend root directory: backend
Frontend root directory: frontend
Backend health endpoint: /api/v1/health
```

Do not copy real passwords, API keys, SMTP credentials, Cloudinary secrets, or
Firebase service-account JSON into this Markdown file, Git, or the browser
frontend. Put them only in Render Environment Variables or Secret Files.

---

## 1. Prepare the external services first

Complete these services before creating the Render services:

- MongoDB Atlas
- Firebase Authentication and Firebase Admin
- Cloudinary
- SMTP provider for order emails

### 1.1 MongoDB Atlas

1. Open MongoDB Atlas and create or select the project and cluster.
2. Create a database user with a strong password.
3. Add a Network Access entry that allows Render to connect.
   - For a class deployment, `0.0.0.0/0` is the usual option.
   - Restrict it further if your MongoDB plan and network setup support it.
4. Copy the application connection string.
5. Replace the password placeholder and use a database name such as:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/ups-battery-store?retryWrites=true&w=majority
```

Do not put this URI in the frontend.

### 1.2 Firebase web application

1. Open Firebase Console and select the project.
2. In **Authentication > Sign-in method**, enable:
   - Email/Password
   - Google, if Google login is required
3. In **Project settings > Your apps**, copy the web app configuration.
4. Keep these values for the frontend Render environment variables:
   - API key
   - Auth domain
   - Project ID
   - Storage bucket
   - Messaging sender ID
   - App ID
5. In **Authentication > Settings > Authorized domains**, add the final
   Render frontend hostname, for example:

```text
your-frontend.onrender.com
```

Do not add `https://` in the Authorized Domains field.

### 1.3 Firebase Admin service account

1. In Firebase Console, open **Project settings > Service accounts**.
2. Select **Generate new private key**.
3. Save the downloaded JSON securely.
4. Do not commit the JSON file.
5. The file will be uploaded to the backend Render service as a Secret File
   in Step 4.

The backend uses `admin.credential.applicationDefault()`. Render must
therefore receive the service-account JSON as a file and the
`GOOGLE_APPLICATION_CREDENTIALS` variable must point to that file.

### 1.4 Cloudinary

From Cloudinary, keep:

- Cloud name
- API key
- API secret

These are backend-only variables. The frontend does not need Cloudinary
credentials.

### 1.5 SMTP

Use an SMTP provider that permits the deployed application to send email.
Keep:

- SMTP host
- SMTP port
- SMTP username
- SMTP password
- From address

Without SMTP variables, orders can still be created but customer email
notifications will not be delivered.

---

## 2. Check the repository before deployment

From PowerShell:

```powershell
cd C:\itcp318
git status
```

Confirm these files exist:

```text
backend/package.json
backend/server.js
backend/app.js
backend/config/firebaseAdmin.js
frontend/package.json
frontend/vite.config.js
frontend/index.html
```

Run the same checks Render will run:

```powershell
cd C:\itcp318\frontend
npm install
npm run build

cd C:\itcp318\backend
npm install
node --check server.js
```

The frontend build output must be created in:

```text
frontend/dist
```

Do not use `npm run dev` as a Render production command.

---

## 3. Deploy the backend Web Service

### 3.1 Create the service

1. Sign in to [Render](https://render.com).
2. Select **New > Web Service**.
3. Connect the GitHub repository.
4. Select the repository branch to deploy.
5. Use these exact settings:

| Render setting | Value |
|---|---|
| Name | `itcp318-backend` |
| Region | Choose one region and use the same region for frontend if possible |
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/api/v1/health` |

The backend `server.js` already reads Render's `PORT` variable:

```js
app.listen(Number(process.env.PORT) || 4001)
```

Do not hard-code a Render port.

### 3.2 Add backend environment variables

In the backend service, open **Environment > Add Environment Variable** and add
the following. Use the actual production values; the values below are names
and examples only.

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://YOUR-FRONTEND.onrender.com` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `DNS_SERVERS` | `1.1.1.1,8.8.8.8` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_HOST` | SMTP host |
| `SMTP_PORT` | `587` or provider port |
| `SMTP_SECURE` | `false` for STARTTLS/587, `true` for implicit TLS |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | Verified sender address |
| `GOOGLE_APPLICATION_CREDENTIALS` | `/etc/secrets/firebase-service-account.json` |

Do not manually set `PORT` unless Render specifically requires it. Render
provides `PORT` to the process automatically.

`CLIENT_URL` must be the exact frontend origin, without a trailing slash:

```text
https://your-frontend.onrender.com
```

The backend CORS configuration compares this value with the browser origin.
A wrong value causes browser CORS errors even when the API is running.

### 3.3 Add the Firebase Secret File

In the backend service:

1. Open **Environment**.
2. Find **Secret Files**.
3. Add a secret file with this filename:

```text
firebase-service-account.json
```

4. Paste the complete Firebase service-account JSON content.
5. Save the secret file.
6. Confirm the environment variable is exactly:

```text
GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/firebase-service-account.json
```

Never paste the service-account JSON into a normal frontend variable. Never
prefix it with `VITE_`.

### 3.4 Deploy and test the backend

Click **Create Web Service** or **Manual Deploy > Deploy latest commit**.
Wait until the service is **Live**, then open:

```text
https://YOUR-BACKEND.onrender.com/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "service": "UPS Battery Store"
}
```

If the health endpoint fails, do not deploy the frontend yet. Open the backend
Render logs and fix the first startup error.

Common backend startup errors:

| Log message | Fix |
|---|---|
| `MongooseServerSelectionError` | Check `MONGO_URI` and Atlas Network Access. |
| `Could not load the default credentials` | Check the Secret File filename and `GOOGLE_APPLICATION_CREDENTIALS` path. |
| `Invalid service account` | Upload the complete, valid Firebase Admin JSON. |
| `Cannot connect to SMTP` | Check SMTP host, port, credentials, and secure mode. |
| `CORS` browser error | Set backend `CLIENT_URL` to the exact frontend URL. |

---

## 4. Deploy the frontend Static Site

### 4.1 Create the static site

1. Select **New > Static Site** in Render.
2. Select the same GitHub repository and branch.
3. Use these exact settings:

| Render setting | Value |
|---|---|
| Name | `itcp318-frontend` |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

The frontend build runs at deploy time, so `VITE_*` variables must be present
before the build starts.

### 4.2 Add frontend environment variables

In the frontend static site, open **Environment** and add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://YOUR-BACKEND.onrender.com/api/v1` |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase web app ID |

Important:

- `VITE_API_URL` must end with `/api/v1`.
- Use `https://`, not `http://`.
- Do not put `MONGO_URI`, Cloudinary secret, SMTP password, or Firebase Admin
  service-account content in the frontend.
- Any `VITE_*` value is visible in the built browser JavaScript. Only use
  Firebase web configuration values there.

Click **Create Static Site** or redeploy after adding the variables.

### 4.3 Configure React Router rewrites

The application uses React Router. Without a rewrite, opening or refreshing a
route such as `/login`, `/dashboard`, or `/product/ID` can return a Render
404.

In the frontend Static Site, open **Redirects/Rewrites** and add:

| Source | Destination | Action |
|---|---|---|
| `/*` | `/index.html` | Rewrite |

Save and redeploy the frontend.

---

## 5. Connect and test the deployed system

Use this order so each failure is easy to identify.

### 5.1 Backend health

Open:

```text
https://YOUR-BACKEND.onrender.com/api/v1/health
```

It must return the expected JSON before frontend testing.

### 5.2 Public product API

Open:

```text
https://YOUR-BACKEND.onrender.com/api/v1/products
```

It should return a JSON response. If it returns a database error, fix MongoDB
Atlas before continuing.

### 5.3 Frontend loading

Open:

```text
https://YOUR-FRONTEND.onrender.com
```

Open the browser developer tools and confirm:

- No request still points to `localhost`.
- Product requests use the deployed backend URL.
- There are no CORS errors.
- The browser console has no Firebase configuration error.

### 5.4 Authentication

Test:

1. Register a test account.
2. Sign in with email/password.
3. Sign in with Google if enabled.
4. Confirm the user appears in the application.
5. Confirm Firebase Authorized Domains contains the frontend hostname.

### 5.5 Product and checkout

Test with a non-production/test product:

1. Open the product catalog.
2. Test price, category, and rating filters.
3. Open a product details page directly, then refresh it.
4. Add an item to cart.
5. Complete shipping, confirmation, and COD checkout.
6. Confirm the order appears in the user's orders.
7. As an admin, update the order status.
8. Confirm the email and PDF receipt if SMTP is configured.

### 5.6 Admin account

Register through Firebase first. Then set the synchronized MongoDB user's role
to `admin` in MongoDB Atlas:

```js
db.users.updateOne(
  { email: "your-test-email@example.com" },
  { $set: { role: "admin" } }
)
```

Sign out and sign in again after changing the role. Do not store a password in
this document.

---

## 6. Optional product seeding

Do not run the seed command automatically on every Render deploy. It can
insert duplicate data or overwrite data depending on the seed implementation.

If the project needs initial products, run the seed once from a controlled
environment with the production `MONGO_URI`:

```powershell
cd C:\itcp318\backend
$env:MONGO_URI="your-production-mongodb-uri"
npm install
npm run seed
```

After seeding, remove the temporary PowerShell variable:

```powershell
Remove-Item Env:\MONGO_URI
```

Only seed a new/empty database or after verifying the seeder behavior.

---

## 7. Deployment checklist

### Backend

- [ ] Render service root is `backend`.
- [ ] Build command is `npm install`.
- [ ] Start command is `npm start`.
- [ ] Health check is `/api/v1/health`.
- [ ] `MONGO_URI` points to MongoDB Atlas.
- [ ] Atlas permits the Render connection.
- [ ] Firebase service account is uploaded as a Secret File.
- [ ] `GOOGLE_APPLICATION_CREDENTIALS` points to `/etc/secrets/firebase-service-account.json`.
- [ ] Cloudinary variables are set.
- [ ] SMTP variables are set if email is required.
- [ ] `CLIENT_URL` exactly matches the deployed frontend origin.

### Frontend

- [ ] Render service type is Static Site.
- [ ] Root is `frontend`.
- [ ] Build command is `npm install && npm run build`.
- [ ] Publish directory is `dist`.
- [ ] `VITE_API_URL` points to the deployed backend and ends in `/api/v1`.
- [ ] All Firebase `VITE_*` values are set.
- [ ] SPA rewrite `/* -> /index.html` is configured.
- [ ] Firebase Authorized Domains contains the Render frontend hostname.
- [ ] Browser requests do not point to localhost.

### Final smoke test

- [ ] Homepage loads.
- [ ] Product list loads.
- [ ] Product detail refresh works.
- [ ] Login/register works.
- [ ] Google login works if enabled.
- [ ] Admin dashboard opens for an admin.
- [ ] Product create/update/delete works.
- [ ] Multiple image upload works.
- [ ] Checkout creates an order.
- [ ] Admin status update works.
- [ ] Email/PDF works when SMTP is configured.

---

## 8. Troubleshooting by symptom

### `404` after refreshing a frontend route

Add or verify the Static Site rewrite:

```text
/* -> /index.html
```

Then redeploy the frontend.

### `Network Error` or API requests go to localhost

Verify the frontend Static Site variable:

```text
VITE_API_URL=https://YOUR-BACKEND.onrender.com/api/v1
```

Because Vite embeds variables during build, save the variable and trigger a
new frontend deploy. A browser refresh alone is not enough.

### CORS error

Set the backend variable to the frontend origin:

```text
CLIENT_URL=https://YOUR-FRONTEND.onrender.com
```

Do not include `/api/v1` in `CLIENT_URL`. Do not add a trailing slash.
Redeploy the backend after changing it.

### Firebase login says unauthorized domain

Add only the hostname, without protocol, to Firebase Authorized Domains:

```text
YOUR-FRONTEND.onrender.com
```

### Backend exits during startup

Check the first error in Render logs. Usually the cause is one of:

- invalid MongoDB URI or Atlas network access
- missing Firebase Secret File
- incorrect `GOOGLE_APPLICATION_CREDENTIALS` path
- malformed environment variable

### Images do not upload

Check Cloudinary variables in the backend service and confirm the request is
going to the deployed backend. Cloudinary secrets must not be added to the
frontend.

### Email is not received

Check SMTP credentials, port, secure mode, verified sender requirements, and
the backend logs. Email is a side effect of order creation/status update and
requires an available SMTP provider.

### Render free service is slow on the first request

Free services may sleep when idle. The first request can take longer while the
service wakes up. Test the backend health endpoint first, then refresh the
frontend.

---

## 9. Safe redeployment procedure

When code changes are pushed:

1. Push the commit to the connected GitHub branch.
2. Wait for the backend deploy to finish.
3. Open the backend health endpoint.
4. Wait for the frontend deploy to finish.
5. Test the frontend in a private/incognito window.
6. Check browser Network and Console tabs.
7. Check Render logs if an API request fails.

Never delete production environment variables to troubleshoot. Change one
variable at a time, redeploy, and verify the health endpoint after each
change.
