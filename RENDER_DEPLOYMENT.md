# Exact Render Deployment Steps

Ang setup na ito ay may **dalawang GitHub repositories** at **dalawang Render
services**:

```text
GitHub repository 1: itcp318-backend
GitHub repository 2: itcp318-frontend
Render service 1: Backend Web Service
Render service 2: Frontend Static Site
```

## Important security rule

Huwag i-paste sa GitHub o sa dokumentong ito ang aktuwal na:

- MongoDB password o buong `MONGO_URI`
- Cloudinary API secret
- SMTP password
- Firebase Admin service-account JSON

Ang values sa ibaba na may `YOUR_...` ay papalitan mo sa Render gamit ang
credentials na kukunin sa instructions.

---

# Part 1 - Gumawa ng dalawang GitHub repositories

## 1.1 Gumawa ng empty repositories sa GitHub

Sa GitHub, piliin ang **New repository** nang dalawang beses:

```text
itcp318-backend
itcp318-frontend
```

Piliin ang **Private** kung maaari. Huwag magdagdag ng README, `.gitignore`,
o license dahil mayroon nang project files.

Kopyahin ang GitHub username mo. Sa commands sa ibaba, palitan ang
`YOUR_GITHUB_USERNAME`.

## 1.2 I-push ang backend repository

Buksan ang PowerShell at patakbuhin nang sunod-sunod:

```powershell
cd C:\itcp318
New-Item -ItemType Directory -Force C:\itcp318-deploy
New-Item -ItemType Directory -Force C:\itcp318-deploy\itcp318-backend
robocopy C:\itcp318\backend C:\itcp318-deploy\itcp318-backend /E /XD node_modules dist /XF .env firebase-service-account.json
cd C:\itcp318-deploy\itcp318-backend
@"
node_modules/
dist/
.env
.env.*
!.env.example
config/.env
firebase-service-account.json
"@ | Set-Content .gitignore
git init
git branch -M main
git add .
git commit -m "Prepare backend for Render"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/itcp318-backend.git
git push -u origin main
```

## 1.3 I-push ang frontend repository

```powershell
cd C:\itcp318
New-Item -ItemType Directory -Force C:\itcp318-deploy\itcp318-frontend
robocopy C:\itcp318\frontend C:\itcp318-deploy\itcp318-frontend /E /XD node_modules dist /XF .env
cd C:\itcp318-deploy\itcp318-frontend
@"
node_modules/
dist/
.env
.env.*
!.env.example
"@ | Set-Content .gitignore
git init
git branch -M main
git add .
git commit -m "Prepare frontend for Render"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/itcp318-frontend.git
git push -u origin main
```

Sa bawat `git push`, mag-login sa GitHub kapag tinanong. Ang dalawang
repositories ay dapat may `package.json` sa root nila:

```text
itcp318-backend/package.json
itcp318-backend/server.js
itcp318-frontend/package.json
itcp318-frontend/index.html
```

---

# Part 2 - Ihanda ang credentials

## 2.1 MongoDB Atlas: `MONGO_URI`

1. Pumunta sa [MongoDB Atlas](https://cloud.mongodb.com).
2. Piliin ang project at cluster.
3. Pumunta sa **Database Access**.
4. Gumawa o gamitin ang database user at password.
5. Pumunta sa **Network Access**.
6. Piliin ang **Add IP Address**.
7. Para sa Render deployment, ilagay ang:

```text
0.0.0.0/0
```

8. Pumunta sa **Database > Connect > Drivers**.
9. Piliin ang **Node.js**.
10. Kopyahin ang connection string.
11. Palitan ang `<password>` ng database-user password.
12. Gamitin ang database name na `ups-battery-store`.

Ito ang ilalagay sa Render backend bilang `MONGO_URI`:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/ups-battery-store?retryWrites=true&w=majority
```

Huwag ilagay ang `MONGO_URI` sa frontend.

## 2.2 Firebase web values

1. Pumunta sa [Firebase Console](https://console.firebase.google.com).
2. Piliin ang Firebase project.
3. Pumunta sa **Project settings**.
4. Sa **Your apps**, piliin ang Web app.
5. Kung wala pang Web app, piliin ang **Add app > Web**.
6. Kopyahin ang values mula sa Firebase config:

```text
apiKey              -> VITE_FIREBASE_API_KEY
authDomain          -> VITE_FIREBASE_AUTH_DOMAIN
projectId           -> VITE_FIREBASE_PROJECT_ID
storageBucket       -> VITE_FIREBASE_STORAGE_BUCKET
messagingSenderId   -> VITE_FIREBASE_MESSAGING_SENDER_ID
appId               -> VITE_FIREBASE_APP_ID
```

7. Pumunta sa **Authentication > Sign-in method**.
8. I-enable ang **Email/Password**.
9. I-enable ang **Google** kung gagamitin ang Google login.

## 2.3 Firebase Admin Secret File

1. Sa Firebase **Project settings**, buksan ang **Service accounts**.
2. Piliin ang **Generate new private key**.
3. I-download ang JSON file.
4. Itago ito. Huwag i-commit sa GitHub.
5. Gagamitin ito sa Render **Secret Files** sa Part 4.

## 2.4 Cloudinary values

1. Pumunta sa [Cloudinary Console](https://console.cloudinary.com).
2. Sa Dashboard, kopyahin:

```text
Cloud name        -> CLOUDINARY_CLOUD_NAME
API Key           -> CLOUDINARY_API_KEY
API Secret        -> CLOUDINARY_API_SECRET
```

Ang API Secret ay backend-only.

## 2.5 SMTP values

Gamitin ang SMTP credentials mula sa inyong email provider o Mailtrap:

```text
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
SMTP_FROM
```

Karaniwang STARTTLS setup:

```text
SMTP_PORT=587
SMTP_SECURE=false
```

Kung walang SMTP setup, puwedeng gumana ang checkout pero hindi ipapadala ang
email/PDF receipt.

---

# Part 3 - Gumawa ng Backend Web Service

1. Pumunta sa [Render Dashboard](https://dashboard.render.com).
2. Piliin ang **New > Web Service**.
3. Piliin ang GitHub repository na `itcp318-backend`.
4. Piliin ang branch na `main`.
5. Ilagay ang settings na ito:

| Render field | Ilagay |
|---|---|
| Name | `itcp318-backend` |
| Region | Piliin ang pinakamalapit sa inyo |
| Root Directory | blank |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Health Check Path | `/api/v1/health` |

6. Huwag magtakda ng sariling `PORT`. Si Render ang nagbibigay ng `PORT`.
7. Huwag pa munang gumawa ng `CLIENT_URL` kung wala pang frontend URL.
8. Piliin ang **Create Web Service**.
9. Hintaying maging **Live**.

Kopyahin ang backend URL na ibibigay ni Render, halimbawa:

```text
https://itcp318-backend.onrender.com
```

Huwag gamitin ang example kung iba ang actual URL mo.

---

# Part 4 - Idagdag ang Backend Environment Variables

Sa Render backend service:

**Environment > Add Environment Variable**

Idagdag ang mga sumusunod:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | MongoDB Atlas connection string mula Part 2.1 |
| `DNS_SERVERS` | `1.1.1.1,8.8.8.8` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud name mula Part 2.4 |
| `CLOUDINARY_API_KEY` | Cloudinary API Key mula Part 2.4 |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret mula Part 2.4 |
| `SMTP_HOST` | SMTP host mula Part 2.5 |
| `SMTP_PORT` | `587` o value ng provider |
| `SMTP_SECURE` | `false` para sa port 587 |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | Verified sender email |
| `CLIENT_URL` | Ilalagay pagkatapos gumawa ng frontend |
| `GOOGLE_APPLICATION_CREDENTIALS` | `/etc/secrets/firebase-service-account.json` |

## Idagdag ang Firebase Secret File

1. Sa parehong Render backend service, pumunta sa **Environment**.
2. Hanapin ang **Secret Files**.
3. Piliin ang **Add Secret File**.
4. Sa filename, ilagay nang eksakto:

```text
firebase-service-account.json
```

5. Sa contents, i-paste ang buong Firebase Admin JSON na na-download sa
   Part 2.3.
6. I-save ang Secret File.
7. I-save ang environment variables.
8. Hintaying matapos ang automatic redeploy.

Ang path na ginagamit ng backend ay eksaktong:

```text
/etc/secrets/firebase-service-account.json
```

Subukan muna ang backend:

```text
https://YOUR-ACTUAL-BACKEND.onrender.com/api/v1/health
```

Expected:

```json
{"success":true,"service":"UPS Battery Store"}
```

Kapag hindi ito gumana, huwag munang gumawa ng frontend. Tingnan muna ang
Render backend **Logs** at ayusin ang unang error.

---

# Part 5 - Palitan ang Frontend API URL

Sa local frontend copy:

```powershell
New-Item -ItemType File -Force C:\itcp318-deploy\itcp318-frontend\.env
notepad C:\itcp318-deploy\itcp318-frontend\.env
```

Palitan ang `VITE_API_URL` gamit ang actual backend URL:

```env
VITE_API_URL=https://YOUR-ACTUAL-BACKEND.onrender.com/api/v1
```

Ang ibang frontend variables ay:

```env
VITE_FIREBASE_API_KEY=Firebase apiKey
VITE_FIREBASE_AUTH_DOMAIN=Firebase authDomain
VITE_FIREBASE_PROJECT_ID=Firebase projectId
VITE_FIREBASE_STORAGE_BUCKET=Firebase storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=Firebase messagingSenderId
VITE_FIREBASE_APP_ID=Firebase appId
```

Palitan ang text na `Firebase ...` gamit ang values mula Part 2.2.

I-check ang build bago i-push:

```powershell
cd C:\itcp318-deploy\itcp318-frontend
npm install
npm run build
git add .
git commit -m "Configure production API URL"
git push
```

> Ang `.env` values na may `VITE_` ay napupunta sa browser build. Huwag
> ilagay rito ang MongoDB, Cloudinary secret, SMTP password, o Admin JSON.

---

# Part 6 - Gumawa ng Frontend Static Site

1. Sa Render Dashboard, piliin ang **New > Static Site**.
2. Piliin ang GitHub repository na `itcp318-frontend`.
3. Piliin ang branch na `main`.
4. Ilagay nang eksakto:

| Render field | Ilagay |
|---|---|
| Name | `itcp318-frontend` |
| Root Directory | blank |
| Build Command | `npm run build` |
| Publish Directory | `dist` |

5. Sa **Environment**, idagdag ang parehong `VITE_*` values na nasa local
   frontend `.env`.
6. Piliin ang **Create Static Site**.
7. Hintaying maging **Live**.

Kopyahin ang actual frontend URL, halimbawa:

```text
https://itcp318-frontend.onrender.com
```

---

# Part 7 - Ayusin ang CORS

## 7.1 Backend Render variable

Sa Render backend service:

**Environment > Add/Edit Environment Variable**

Itakda:

```text
Key:   CLIENT_URL
Value: https://YOUR-ACTUAL-FRONTEND.onrender.com
```

Rules:

- `https://` dapat kasama.
- Walang `/` sa dulo.
- Walang `/api/v1`.

Piliin ang **Save Changes** at hintaying matapos ang redeploy.

## 7.2 Optional local fallback

Hindi kailangan baguhin ang `backend/app.js` dahil ginagamit na nito ang
`process.env.CLIENT_URL`. Kung gusto pa ring lagyan ng fallback, ang code ay:

```js
origin: process.env.CLIENT_URL || "http://localhost:5173",
```

Sa production, ang Render `CLIENT_URL` ang gagamitin.

---

# Part 8 - Firebase Authorized Domain

1. Firebase Console → **Authentication**.
2. Buksan ang **Settings** tab.
3. Sa **Authorized domains**, piliin ang **Add domain**.
4. Ilagay ang frontend hostname lamang:

```text
YOUR-ACTUAL-FRONTEND.onrender.com
```

Huwag ilagay ang `https://`.

---

# Part 9 - React Router rewrite

Sa Render frontend Static Site:

1. Buksan ang **Redirects/Rewrites**.
2. Magdagdag ng:

| Source | Destination | Action |
|---|---|---|
| `/*` | `/index.html` | Rewrite |

3. I-save.
4. Mag-redeploy kung hiningi ni Render.

Ito ang kailangan para gumana ang refresh sa `/login`, `/dashboard`,
`/product/...`, at ibang React routes.

---

# Part 10 - Final test

1. Buksan ang actual frontend URL.
2. Sa browser Developer Tools → **Network**, siguraduhing ang API requests ay
   ganito ang format:

```text
https://YOUR-ACTUAL-BACKEND.onrender.com/api/v1/...
```

3. Siguraduhing walang request na may `localhost`.
4. Test:
   - homepage at product list
   - product details at multiple images
   - price/category/rating filters
   - register/login
   - Google login kung enabled
   - cart at COD checkout
   - user orders
   - admin dashboard
   - product CRUD
   - multiple image upload
   - order status update
   - email/PDF kung naka-configure ang SMTP

## Kapag nag-error

### CORS error

Backend:

```text
CLIENT_URL=https://YOUR-ACTUAL-FRONTEND.onrender.com
```

Frontend:

```env
VITE_API_URL=https://YOUR-ACTUAL-BACKEND.onrender.com/api/v1
```

I-save ang backend variable at i-redeploy ang backend. Kapag nagbago ang
`VITE_API_URL`, i-redeploy din ang frontend.

### Frontend gumagamit ng localhost

Palitan ang `VITE_API_URL`, i-push, at mag-deploy ulit. Hindi sapat ang browser
refresh dahil ang Vite variables ay naka-embed sa build.

### Firebase unauthorized domain

Idagdag ang hostname sa Firebase Authorized domains nang walang `https://`.

### Backend hindi nag-start

Tingnan ang Render Logs at i-check muna:

1. `MONGO_URI` at MongoDB Atlas Network Access.
2. Firebase Secret File filename.
3. `GOOGLE_APPLICATION_CREDENTIALS`.
4. Cloudinary values.
5. SMTP values.

Huwag gumawa ng panibagong code change hangga't hindi nakikita ang unang
startup error sa logs.
