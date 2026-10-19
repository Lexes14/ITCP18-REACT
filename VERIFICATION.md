# Verification checklist

1. Import casing: `frontend/src/Utils/helpers.jsx` and all imports use `Utils`.
2. Firebase auth migration: `frontend/src/firebase.js`, `frontend/src/Components/User/Login.jsx`, `frontend/src/Components/User/Register.jsx`, `backend/config/firebaseAdmin.js`, and `backend/middlewares/auth.js` use Firebase ID tokens; custom JWT credential flows were removed.
3. Firebase profile sync and avatar upload: `backend/routes/auth.js`, `backend/controllers/auth.js`, and `frontend/src/Components/User/UpdateProfile.jsx` implement `/users/sync` and `/me/update` with Multer and Cloudinary.
2. API URL: frontend calls use `import.meta.env.VITE_API` with a local fallback; see `frontend/.env.example`.
3. Cart dedupe: `frontend/src/App.jsx` computes one next array and calls `setCartItems` once.
4. Cart persistence: `frontend/src/App.jsx` uses an effect watching `cartItems`.
5. Auth errors: `backend/middlewares/auth.js` guards Bearer headers and catches JWT failures.
6. Error handling: `backend/utils/catchAsyncErrors.js`, `backend/utils/errorHandler.js`, `backend/middlewares/error.js`; middleware is last in `backend/app.js`.
7. Admin route protection: `backend/routes/auth.js`, `backend/routes/product.js`, and `backend/routes/order.js` use both auth and admin middleware.
8. ProtectedRoute: `frontend/src/Components/Route/ProtectedRoute.jsx` redirects missing or unauthorized users.
9. Map keys: mapped catalog cards, cart rows, stock bars and low-stock rows put keys on outer elements.
10. Window guard: `frontend/src/Utils/helpers.jsx` uses `typeof window !== 'undefined'`.
11. Multer rejection: `backend/utils/multer.js` calls `cb(new Error('Unsupported file type'), false)`.
12. Numeric bounds: `backend/models/product.js` uses `min` and `max`.
13. Upload path: product creation uses `upload.array('images', 10)` and the controller accepts the multipart request without base64 mixing.
14. CORS: `backend/app.js` sets explicit `origin` and `credentials: true`.
15. Code splitting: `frontend/src/App.jsx` lazy-loads `Admin/Dashboard.jsx` with `Suspense`.
16. Router v7: `frontend/src/App.jsx` contains no `exact` route prop.
17. Server shutdown: `backend/server.js` has a PORT fallback plus `unhandledRejection` and `uncaughtException` handling.

## Executed checks

- `node --check` passed for all backend JavaScript files.
- Run `npm install && npm run build` in `frontend/` after dependencies are available.
- Run `npm run seed` with MongoDB available, then verify `GET /api/v1/products`.
