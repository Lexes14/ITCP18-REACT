# CODE DOCUMENTARY

## Purpose and Scope

This is a code-navigation manual for the existing UPS Battery Store repository. It maps user actions to the actual frontend component, handler, API request, backend route, controller, model, database operation, response, and UI update where that path exists.

It is the full system documentary for the ITCP318 project. The focused,
step-by-step documentary for the CRUD and graded feature paths is
[`CRUD_FEATURES.md`](./CRUD_FEATURES.md). Use that file when tracing one
requirement from the screen to the database; use this file for the complete
architecture, routing, API, startup, dependency, file-by-file, and risk
reference.

## How to use this documentary

1. Start with the feature index near the end of this file.
2. Open the listed frontend component and locate the handler named in the
   table.
3. Follow the request to the matching route in `backend/routes`.
4. Read the controller in `backend/controllers` to see validation and
   business rules.
5. Follow the model and utility calls to see database and external-service
   side effects.
6. Return to the reducer or component to see how the response changes the UI.

Unless a section says otherwise, a status describes the actual code path
found in this repository, not a planned feature. Missing external credentials
can prevent runtime verification even when the code path exists.

## Master feature coverage

The detailed implementation traces for these areas are in
[`CRUD_FEATURES.md`](./CRUD_FEATURES.md). The project requirements are
documented by behavior and code path; grading point values are intentionally
not repeated here.

| Area | Main frontend starting point | Main backend starting point | Current implementation |
|---|---|---|---|
| Product CRUD table | `frontend/src/Components/Admin/ProductsList.jsx` | `backend/routes/product.js` | Product list, create, update, single delete, and bulk delete. |
| Multiple photos | `frontend/src/Components/Admin/NewProduct.jsx` | `backend/utils/multer.js`, `cloudinary.js` | Multipart upload of up to 10 images. |
| Product filters | `frontend/src/Components/Home.jsx` | `backend/utils/apiFeatures.js` | Price, category, rating, keyword, and battery-type filters. |
| Review and rating | `frontend/src/Components/Order/ListOrders.jsx` | `backend/controllers/product.js` | Delivered customers can create/update; admins can delete. |
| Review filtering | `frontend/src/Components/Admin/ProductReviews.jsx` | No filter endpoint | Not implemented; list and delete are available. |
| Checkout and orders | `frontend/src/Components/Cart/Payment.jsx` | `backend/controllers/order.js` | COD transaction, stock update, order history, and status flow. |
| Email and receipt | — | `notifyOrder`, `receiptPdf`, `sendEmail` | Email body and PDF attachment require SMTP configuration. |
| Validation and masking | `frontend/src/Utils/validation.js` | `backend/utils/profanityFilter.js` | Yup forms and custom profanity masking. |
| Sales analytics | `frontend/src/Components/Admin/*Chart.jsx` | Order aggregation controllers | Recharts dashboard charts; monthly chart has date inputs. |
| Pagination/infinite scroll | `frontend/src/Components/Home.jsx` | `getProducts` + `APIFeatures` | Server pagination with client infinite-scroll append. |
| Authentication | `frontend/src/Components/User/Login.jsx` | `backend/middlewares/auth.js` | Firebase email/password and Google login. |
| State management | `frontend/src/store.js` | — | Redux reducers and thunk actions. |
| Service CRUD | No active service component | No service model/route | Not implemented; only Product CRUD exists. |

Status labels used here:

- `COMPLETED`: the requested behavior is present in the inspected code.
- `PARTIALLY IMPLEMENTED`: the main path exists but an important part is missing or limited.
- `IMPLEMENTED - NEEDS FIX`: the path exists but has a concrete correctness, UX, or integration issue.
- `NOT IMPLEMENTED`: no working implementation was found.
- `CANNOT VERIFY`: runtime behavior depends on external services or credentials that were not executed here.

The application is a MERN-style UPS product store. There is no separate Service model or Service CRUD domain in the repository.

---

# 1. Complete Project Structure

```text
c:\itcp318\
├── README.md
├── VERIFICATION.md
├── CRUD_FEATURES.md
├── CODE_DOCUMENTARY.md
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── config/
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── database.js
│   │   └── firebaseAdmin.js
│   ├── controllers/
│   │   ├── auth.js
│   │   ├── order.js
│   │   └── product.js
│   ├── data/
│   │   └── products.json
│   ├── middlewares/
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/
│   │   ├── order.js
│   │   ├── product.js
│   │   └── user.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── order.js
│   │   └── product.js
│   ├── seeder/
│   │   └── seeder.js
│   └── utils/
│       ├── apiFeatures.js
│       ├── catchAsyncErrors.js
│       ├── cloudinary.js
│       ├── errorHandler.js
│       ├── multer.js
│       ├── profanityFilter.js
│       ├── receiptPdf.js
│       └── sendEmail.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    ├── public/images/
    └── src/
        ├── App.jsx
        ├── App.css
        ├── index.css
        ├── main.jsx
        ├── firebase.js
        ├── store.js
        ├── actions/
        │   ├── cartActions.jsx
        │   ├── orderActions.jsx
        │   ├── productActions.jsx
        │   └── userActions.jsx
        ├── reducers/
        │   ├── cartReducers.jsx
        │   ├── orderReducers.jsx
        │   ├── productReducers.jsx
        │   └── userReducers.jsx
        ├── Utils/
        │   ├── helpers.jsx
        │   └── validation.js
        └── Components/
            ├── Home.jsx
            ├── HomeFilters.css
            ├── Layout/
            │   ├── Footer.jsx
            │   ├── Header.jsx
            │   ├── Loader.jsx
            │   ├── MetaData.jsx
            │   └── Search.jsx
            ├── Admin/
            │   ├── Admin.css
            │   ├── AdminImages.css
            │   ├── Dashboard.jsx
            │   ├── DashboardOverview.jsx
            │   ├── MonthlySalesChart.jsx
            │   ├── NewProduct.jsx
            │   ├── OrdersList.jsx
            │   ├── ProcessOrder.jsx
            │   ├── ProductReviews.jsx
            │   ├── ProductSalesChart.jsx
            │   ├── ProductsList.jsx
            │   ├── SideBar.jsx
            │   ├── UpdateProduct.jsx
            │   ├── UpdateUser.jsx
            │   ├── UserSalesChart.jsx
            │   └── UsersList.jsx
            ├── Cart/
            │   ├── Cart.jsx
            │   ├── CheckoutSteps.jsx
            │   ├── ConfirmOrder.jsx
            │   ├── OrderSuccess.jsx
            │   ├── Payment.jsx
            │   └── Shipping.jsx
            ├── Order/
            │   ├── ListOrders.jsx
            │   └── OrderDetails.jsx
            ├── Product/
            │   ├── Product.jsx
            │   ├── ProductDetails.jsx
            │   └── ProductMedia.css
            ├── Review/
            │   └── ListReviews.jsx
            ├── Route/
            │   └── ProtectedRoute.jsx
            └── User/
                ├── ForgotPassword.jsx
                ├── Login.jsx
                ├── NewPassword.jsx
                ├── Profile.css
                ├── Profile.jsx
                ├── Register.jsx
                └── UpdatePassword.jsx
```

## Folder responsibilities

| Folder | Purpose | Actual functionality |
|---|---|---|
| `backend/config` | External-service configuration | Mongoose connection and Firebase Admin initialization; local environment files are also here. |
| `backend/controllers` | HTTP/business handlers | Authentication/profile, product/review, and order/analytics logic. |
| `backend/middlewares` | Request guards and error handling | Firebase bearer-token verification, admin role checks, and final Express error response. |
| `backend/models` | Mongoose schemas | `User`, `Product` with embedded reviews, and `Order` with embedded order items. |
| `backend/routes` | Express endpoint registration | Mounts auth, product/review, and order/admin endpoints. |
| `backend/utils` | Shared backend services/helpers | Filtering, async errors, Cloudinary, uploads, profanity masking, email, PDF generation. |
| `frontend/src/Components` | React screens and feature components | Storefront, admin dashboard, checkout, orders, products, reviews, and user pages. |
| `frontend/src/actions` | Redux thunks/actions | Cart actions, order creation thunk, product API loading, and Firebase-user state actions. |
| `frontend/src/reducers` | Redux state reducers | Cart/shipping state, order lifecycle, product state, and user request/success/failure state. |
| `frontend/src/Utils` | Client helpers and validation | Firebase token/local storage helpers, toast errors, and Yup schemas. |

Important architecture fact: there is no `services/` folder and no separate service layer. Controllers call Mongoose models and utility modules directly.

---

# 2. Technology Stack

| Technology/package | Installed in | Actual use |
|---|---|---|
| React 19 | `frontend/package.json` | UI components and page rendering. |
| Vite | `frontend/package.json`, `vite.config.js` | Frontend development/build tool. |
| React Router DOM 7 | frontend | Routes are declared in `frontend/src/App.jsx`. |
| Express 5 | `backend/package.json` | HTTP server and route middleware. |
| Mongoose | backend | MongoDB connection and `User`, `Product`, `Order` schemas. |
| Firebase client | frontend | Email/password, Google login, reset password, Firebase ID tokens. |
| Firebase Admin | backend | Verifies Firebase ID tokens and loads Firebase users. |
| Axios | frontend | HTTP requests from components and Redux actions. |
| Redux, React Redux, Redux Thunk | frontend | Product/user state, Redux-managed cart/shipping state, order lifecycle state, and async API actions. |
| Multer | backend | In-memory multipart upload handling for product images and avatars. |
| Cloudinary | backend | Product/avatar image upload and deletion. |
| Nodemailer | backend | SMTP email delivery and PDF attachments. |
| PDFKit | backend | Generates receipt PDF buffers. |
| Yup | frontend | `productSchema` and `loginSchema` validation through `validate`. |
| Recharts | frontend | Monthly, product, and customer sales charts. |
| React Toastify | frontend | `successMsg` and `errMsg` notifications. |
| CORS/cookie-parser | backend | CORS configuration and cookie parsing middleware. Cookie authentication is not used. |
| `validator` | backend | Declared dependency; no meaningful direct application usage was verified. |
| MUI/Data Grid | frontend | Declared dependencies; no active inspected component imports them. Tables are custom HTML tables. |
| SweetAlert2 | frontend | Declared dependency; active flows use `window.confirm` and React Toastify instead. |
| Tailwind Vite plugin | frontend | Declared/configured dependency; active screens use custom CSS classes. |
| React Helmet | frontend | Declared dependency; `MetaData.jsx` exists but is not part of the active route flow. |

External integrations are MongoDB Atlas, Firebase Authentication, Cloudinary, and SMTP/Mailtrap-style email configuration. Runtime connectivity was not verified in this documentation pass.

---

# 3. Application Startup Flow

## Backend startup

```text
npm start / npm run dev
    ↓
backend/server.js
    ↓
require('dotenv').config({ path: './config/.env' })
    ↓
require('./app')
    ↓
connectDatabase() from config/database.js
    ↓
app.listen(Number(process.env.PORT) || 4001)
```

`backend/app.js` configures CORS, JSON (`10mb`), URL encoding, cookies, the health endpoint, and mounts all routes under `/api/v1`:

- `auth` routes
- `product` and review routes
- `order` and admin analytics routes
- `errorMiddleware` last

`backend/config/database.js` connects Mongoose to `process.env.MONGO_URI` and optionally applies `DNS_SERVERS`.

`backend/config/firebaseAdmin.js` initializes Firebase Admin with `applicationDefault()`. The service-account environment configuration must be available for runtime authentication.

The server handles `unhandledRejection` and `uncaughtException` through `shutdown`. The default port in code is `4001`; the local `.env.example` documents `5000`, so the effective value comes from the active environment file.

## Frontend startup

```text
npm run dev / npm run build
    ↓
frontend/index.html
    ↓
frontend/src/main.jsx
    ↓
BrowserRouter + Provider(store)
    ↓
frontend/src/App.jsx
    ↓
Routes and feature components
```

`App.jsx` selects cart/shipping state from the Redux `cart` reducer, persists both to `localStorage`, applies dark mode, handles sign-out, and declares the route tree. The admin dashboard is lazy-loaded with `Suspense`.

---

# 4. Complete Routing Documentation

## Frontend routes

| Route | Component in `App.jsx` | Purpose | Status |
|---|---|---|---|
| `/` | `Home` | Product catalog, search, filters, infinite scroll. | COMPLETED |
| `/search/:keyword` | `Home` | Catalog search using route keyword. | COMPLETED |
| `/product/:id` | `ProductDetails` | Product details, images, runtime calculator, add to cart. | PARTIALLY IMPLEMENTED; public review display is absent. |
| `/cart` | `Cart` | Cart rows, quantity updates, removal, totals. | COMPLETED |
| `/checkout/shipping` | `Shipping` | Shipping form. | PARTIALLY IMPLEMENTED; backend shipping validation is limited. |
| `/checkout/confirm` | `ConfirmOrder` | Order confirmation. | COMPLETED |
| `/checkout/payment` | `Payment` | COD order submission. | PARTIALLY IMPLEMENTED; online payment is not implemented. |
| `/order/success/:id` | `OrderSuccess` | Order success message. | COMPLETED |
| `/orders` | `ListOrders` | User orders and delivered-product review form. | PARTIALLY IMPLEMENTED; review edit UI is limited. |
| `/orders/:id` | `OrderDetails` | User order details. | COMPLETED |
| `/login` | `Login` | Email/password and Google sign-in. | COMPLETED |
| `/register` | `Register` | Firebase registration and profile sync. | COMPLETED |
| `/password/forgot` | `ForgotPassword` | Firebase reset email. | COMPLETED |
| `/password/new/:token` | `NewPassword` | Password reset completion page. | Present; actual reset is Firebase-based. |
| `/password/update` | `UpdatePassword` | Authenticated Firebase password change. | COMPLETED |
| `/profile` | `Profile` | Profile and avatar update. | COMPLETED |
| `/dashboard` | lazy `Dashboard` | Admin overview, products, users, orders, reviews. | COMPLETED for implemented tabs. |

`ProtectedRoute.jsx` exists but the main route tree primarily protects access inside components (`getUser`, `Navigate`) instead of consistently wrapping all protected routes.

## Backend API routes

The route files are mounted under `/api/v1` by `backend/app.js`.

### Authentication and users (`backend/routes/auth.js`)

| Method | Endpoint | Middleware | Controller |
|---|---|---|---|
| POST | `/users/sync` | `isAuthenticatedUser`, `upload.single('avatar')` | `syncUser` |
| GET | `/me` | `isAuthenticatedUser` | `getUserProfile` |
| PUT | `/me/update` | `isAuthenticatedUser`, `upload.single('avatar')` | `updateProfile` |
| PUT | `/password/update` | `isAuthenticatedUser` | `updatePassword` |
| GET | `/admin/users` | auth + admin | `getAllUsers` |
| GET | `/admin/user/:id` | auth + admin | `getUser` |
| PUT | `/admin/user/:id` | auth + admin | `updateUser` |
| DELETE | `/admin/user/:id` | auth + admin | `deleteUser` |

### Products and reviews (`backend/routes/product.js`)

| Method | Endpoint | Middleware | Controller |
|---|---|---|---|
| GET | `/products` | none | `getProducts` |
| GET | `/product/:id` | none | `getProduct` |
| POST | `/admin/product/new` | auth + admin + `upload.array('images', 10)` | `newProduct` |
| PUT | `/admin/product/:id` | auth + admin + `upload.array('images', 10)` | `updateProduct` |
| DELETE | `/admin/product/:id` | auth + admin | `deleteProduct` |
| DELETE | `/admin/products/bulk` | auth + admin | `bulkDeleteProducts` |
| DELETE | `/admin/product/:id/image/:imageId` | auth + admin | `deleteProductImage` |
| GET | `/admin/products` | auth + admin | `getAdminProducts` |
| GET | `/admin/reviews` | auth + admin | `getAdminReviews` |
| PUT | `/review` | auth | `createOrUpdateReview` |
| GET | `/reviews` | auth | `getProductReviews` |
| DELETE | `/reviews` | auth + admin | `deleteReview` |

### Orders and analytics (`backend/routes/order.js`)

| Method | Endpoint | Middleware | Controller |
|---|---|---|---|
| POST | `/order/new` | auth | `newOrder` |
| GET | `/orders/me` | auth | `myOrders` |
| GET | `/order/:id` | auth | `getOrder` |
| GET | `/admin/orders` | auth + admin | `getAllOrders` |
| PUT | `/admin/order/:id` | auth + admin | `updateOrder` |
| DELETE | `/admin/order/:id` | auth + admin | `deleteOrder` |
| GET | `/admin/total-orders` | auth + admin | `stats` |
| GET | `/admin/total-sales` | auth + admin | `totalSales` |
| GET | `/admin/customer-sales` | auth + admin | `customerSales` |
| GET | `/admin/sales-per-month` | auth + admin | `salesPerMonth` |
| GET | `/admin/product-sales` | auth + admin | `productSales` |

Health endpoint: `GET /api/v1/health` is defined directly in `backend/app.js`.

---

# 5. Complete API Documentation and Request Flows

## Product list/filter API

```text
Home.jsx state (keyword/category/batteryType/rating/maxPrice)
    ↓
getProducts() in Home.jsx
    ↓
fetchProducts() in actions/productActions.jsx
    ↓
GET /api/v1/products?...
    ↓
product route → getProducts
    ↓
APIFeatures.search().filter().pagination(12)
    ↓
Product.find(filter).limit(12).skip(...)
    ↓
products response
    ↓
productReducers.jsx
    ↓
Home renders product cards and infinite-scroll append
```

Response fields used by the frontend: `products`, `productsCount`, `resPerPage`, and `filteredProductsCount`.

Supported query behavior in `backend/utils/apiFeatures.js`:

- `keyword`: regex search on `name`, `brand`, and `sku`.
- `category`: exact product category.
- `specs[batteryType]`: nested field filter.
- `rating:gte:4` or `rating:gte:4.5`: maps to `ratings: { $gte: value }`.
- `price[lte]`: maps to `price: { $lte: value }`.
- `page`: server-side pagination with 12 records per page.

## Product create/update/delete APIs

Create: `NewProduct.submit` builds `FormData`, appends form fields and every selected `images` file, then sends `POST /admin/product/new`. `upload.array('images', 10)` stores files in memory, `newProduct` uploads buffers to Cloudinary, and `Product.create` stores returned `{ public_id, url }` values.

Update: `UpdateProduct.submit` builds multipart `FormData`, sends `PUT /admin/product/:id`, and `updateProduct` appends newly uploaded Cloudinary images to the existing `product.images` array. Existing images can be deleted through `DELETE /admin/product/:id/image/:imageId`.

Single delete: `ProductsList.removeProduct` sends `DELETE /admin/product/:id`. `deleteProduct` removes the MongoDB document and deletes stored Cloudinary images.

Bulk delete: `ProductsList.bulkDelete` sends `{ ids: selected }` in a DELETE request to `/admin/products/bulk`. `bulkDeleteProducts` loads matching products, calls `deleteMany`, then deletes their Cloudinary images.

## Review API

`ListOrders.submitReview` sends `{ productId, rating, comment }` to `PUT /api/v1/review`. `createOrUpdateReview`:

1. Loads the product.
2. Finds a matching delivered order for `req.user._id` and the product.
3. Masks name/comment with `maskProfanity`.
4. Updates the existing embedded review belonging to the user, or pushes a new review.
5. Recomputes `numOfReviews` and average `ratings`.
6. Saves the product and returns `{ success: true }`.

Review retrieval is `GET /api/v1/reviews?id=<productId>` and admin retrieval is `GET /api/v1/admin/reviews`. The active product-detail UI does not render the returned reviews. Review filter is `NOT IMPLEMENTED`.

## Order API

`Payment.submit` sends the cart and shipping data to `POST /api/v1/order/new`. The backend deliberately re-fetches each product and recalculates price and totals from MongoDB; it does not trust the client totals. It validates product existence and stock, creates the order, decrements stock, sends an email/PDF notification, and returns the new order.

`OrdersList.updateStatus` sends `{ status }` to `PUT /api/v1/admin/order/:id`. `updateOrder` validates the status transition, sets `deliveredAt` when delivered, saves the order, and sends an updated email/PDF receipt.

## Auth API

The Firebase client obtains an ID token. `Login.finishLogin` or `Register.submit` sends the token in `Authorization: Bearer <token>` to `POST /api/v1/users/sync`. The backend verifies the token using Firebase Admin, finds/creates the MongoDB user, and returns the synchronized user profile. `helpers.authenticate` stores the token/user locally for subsequent requests.

`isAuthenticatedUser` is the actual authorization gate. It verifies the Firebase ID token, looks up `User.firebaseUid`, assigns `req.user`, and rejects missing/invalid tokens. `authorizeRoles('admin')` checks `req.user.role`.

## Email/PDF API side effects

There is no separate email HTTP endpoint. Email is a backend side effect of `newOrder` and `updateOrder`:

```text
newOrder/updateOrder
    ↓
notifyOrder(order, user, subject)
    ↓
receiptPdf(order, user) → Buffer
    ↓
sendEmail({ email, subject, message, attachments })
    ↓
Nodemailer SMTP transport
```

`backend/controllers/order.js` puts products, quantities, line totals, subtotal, and grand total in the email text. `receiptPdf.js` puts order/customer/payment/product/total data in the PDF buffer. Email errors are logged and do not fail the order/status HTTP response.

---

# 6. Functional Requirements: Requirement-to-Code Documentary

## FR-01 — Product CRUD DataTable

### Requirement
Admin can create, read, update, and delete products through a data table.

### Status
`COMPLETED`

### Where to Start
`frontend/src/Components/Admin/ProductsList.jsx`

### Navigation Path

```text
Dashboard.jsx
    ↓
ProductsList.jsx
    ↓
loadProducts() / onCreate / onEdit / removeProduct() / bulkDelete()
    ↓
/admin/products or /admin/product/:id
    ↓
backend/routes/product.js
    ↓
getAdminProducts(), newProduct(), updateProduct(), deleteProduct()
    ↓
Product model
    ↓
MongoDB products collection
    ↓
JSON response
    ↓
ProductsList local state / editor state
```

### Step-by-step

1. `Dashboard` selects the Products tab.
2. `ProductsList` loads `GET /api/v1/admin/products` with a Firebase bearer token.
3. The response populates the HTML table.
4. `NewProduct` creates a product with `POST /api/v1/admin/product/new`.
5. `UpdateProduct` edits a product with `PUT /api/v1/admin/product/:id`.
6. `removeProduct` deletes one product.
7. `bulkDelete` sends selected IDs for one bulk operation.
8. The list state is updated locally or refreshed through `refreshKey`.

### Exact files/functions

- Frontend: `Dashboard`, `ProductsList`, `NewProduct`, `UpdateProduct`.
- Handlers: `loadProducts`, `removeProduct`, `bulkDelete`, `submit` in create/update forms.
- Backend: `backend/routes/product.js`, `getAdminProducts`, `newProduct`, `updateProduct`, `deleteProduct`, `bulkDeleteProducts`.
- Model: `backend/models/product.js`, Mongoose `Product`.
- Search keywords: `ProductsList`, `getAdminProducts`, `newProduct`, `updateProduct`, `bulkDeleteProducts`, `/admin/products`.

## FR-02 — Upload Multiple Photos

### Requirement
Admin can upload multiple product photos.

### Status
`COMPLETED`

### Navigation Path

```text
NewProduct / UpdateProduct file input multiple
    ↓
FormData.append('images', image)
    ↓
POST or PUT /api/v1/admin/product...
    ↓
upload.array('images', 10)
    ↓
req.files buffers
    ↓
cloudinary.uploadBuffer()
    ↓
Product.images [{ public_id, url }]
    ↓
Product form/list image display
```

`multer.js` accepts JPEG, PNG, and WebP and limits each file to 5 MB. The client accepts multiple files; the route enforces a maximum of 10. Client-side count validation is not separately implemented.

## FR-03 — Bulk Delete Using Checkboxes

### Requirement
Admin can select products with checkboxes and delete them in bulk.

### Status
`COMPLETED`

### Navigation Path

```text
ProductsList row checkbox / select-all-visible checkbox
    ↓
selected state array
    ↓
toggle() / toggleAll()
    ↓
bulkDelete()
    ↓
DELETE /api/v1/admin/products/bulk with { ids }
    ↓
admin auth middleware
    ↓
bulkDeleteProducts()
    ↓
Product.find() + Product.deleteMany()
    ↓
Cloudinary deleteImage() for stored images
    ↓
ProductsList filters deleted rows and clears selection
```

The select-all action applies to currently visible filtered products, not necessarily every product loaded from another page.

## FR-04 — Price Filter

### Requirement
Customer can filter products by price.

### Status
`COMPLETED`

### Where to Start
`frontend/src/Components/Home.jsx`

### Navigation Path

```text
Maximum price range input
    ↓
setMaxPrice()
    ↓
Home useEffect dependency
    ↓
URLSearchParams { 'price[lte]': maxPrice }
    ↓
fetchProducts()
    ↓
GET /api/v1/products?price[lte]=...
    ↓
APIFeatures.filter()
    ↓
Product.find({ price: { $lte: value } })
    ↓
Home product cards
```

The range is PHP 0 to PHP 160,000 with a PHP 500 step. The filter uses base `price`, while cards display `salePrice || price` when available; therefore sale-price semantics are not separately filtered.

## FR-05 — Category Filter

### Requirement
Customer can filter products by category.

### Status
`COMPLETED`

`Home` renders the category button list and sends `category` in `URLSearchParams`. `APIFeatures.filter()` creates an exact field filter. The allowed categories are defined in the Product schema enum.

Search keywords: `categories`, `setCategory`, `category`, `APIFeatures`, `productSchema`.

## FR-06 — Ratings Filter

### Requirement
Customer can filter products by rating.

### Status
`COMPLETED`

`Home` renders `Any rating`, `4+ stars`, and `4.5+ stars`. It sends `rating: gte:<value>`. `apiFeatures.js` maps field `rating` to stored field `ratings` and the colon operator to `$gte`. The product model stores the aggregate rating in `ratings` with a 0-5 bound.

## FR-07 — Review Filter

### Requirement
Customer/admin can filter reviews.

### Status
`NOT IMPLEMENTED`

`ProductReviews.jsx` loads and displays all admin reviews and supports deletion, but has no search, product selector, rating selector, comment filter, or filter endpoint. `ListReviews.jsx` is only a heading component. Do not confuse the implemented product ratings filter with a review-record filter.

## FR-08 — User Can Review/Rate Product

### Requirement
A user who completed a transaction can submit a review/rating.

### Status
`COMPLETED`

### Navigation Path

```text
ListOrders.jsx
    ↓
Delivered order item review form
    ↓
submitReview(productId)
    ↓
PUT /api/v1/review
    ↓
isAuthenticatedUser
    ↓
createOrUpdateReview()
    ↓
Order.findOne({ user, orderStatus: 'Delivered', orderItems.product })
    ↓
Product.reviews.push() + ratings recalculation
    ↓
{ success: true }
    ↓
submitted state / success toast
```

Eligibility is verified server-side by finding an order owned by the authenticated Firebase-synchronized user, with exactly `orderStatus: 'Delivered'`, containing the product. The frontend condition alone is not the security control.

Validation is partly schema-backed: embedded review `rating` is 1-5 and comment max length is 1000 in `product.js`; the controller masks profanity. Explicit controller validation for missing/NaN values is limited.

## FR-09 — User Can Update Own Review/Rating

### Requirement
A user can update their own review/rating.

### Status
`IMPLEMENTED - NEEDS FIX`

### Backend navigation

```text
PUT /api/v1/review
    ↓
createOrUpdateReview()
    ↓
product.reviews.find(item => item.user == req.user._id)
    ↓
Object.assign(existing, review)
    ↓
recalculate numOfReviews and ratings
    ↓
product.save()
```

Ownership is enforced by matching the embedded review's `user` to `req.user._id`; the request does not accept an arbitrary review ID for updates.

The limitation is frontend UX: `ListOrders.jsx` marks the local item as `submitted` and hides the form. There is no direct edit button in the same session. Reloading the Orders page permits resubmission, which the backend converts into an update.

## FR-10 — Admin Can Delete Review

### Requirement
Admin can delete a review.

### Status
`IMPLEMENTED - NEEDS FIX`

```text
Dashboard Reviews tab
    ↓
ProductReviews.remove(review)
    ↓
DELETE /api/v1/reviews with productId and review id
    ↓
isAuthenticatedUser + authorizeRoles('admin')
    ↓
deleteReview()
    ↓
filter product.reviews
    ↓
recalculate numOfReviews and ratings
    ↓
Product.save()
```

Concrete issue: `deleteReview` does not explicitly reject when the review ID matches no embedded review; it can return success after saving unchanged data.

## FR-11 — Completed Transaction

### Requirement
Customer can move from product selection through cart, checkout, transaction storage, and completion.

### Status
`PARTIALLY IMPLEMENTED`

### Navigation Path

```text
Home/ProductDetails
    ↓
App.addItemToCart()
    ↓
localStorage cartItems
    ↓
Cart.jsx
    ↓
Shipping.jsx
    ↓
ConfirmOrder.jsx
    ↓
Payment.jsx (COD)
    ↓
POST /api/v1/order/new
    ↓
newOrder()
    ↓
Product.findById + stock validation + server price calculation
    ↓
Order.create()
    ↓
Product stock decrement
    ↓
notifyOrder()
    ↓
OrderSuccess.jsx
```

The order flow is real and server-side totals are recalculated. Online payments are `NOT IMPLEMENTED`; the only payment value is COD. Shipping-field validation is limited, stock check/decrement is not one database transaction, and direct navigation can bypass a formal checkout-step guard.

## FR-12 — Admin Updates Transaction Status

### Requirement
Admin can update an order status.

### Status
`COMPLETED`

`OrdersList.updateStatus` calls `PUT /api/v1/admin/order/:id`. `updateOrder` allows `Processing`, `Shipped`, `Delivered`, or `Cancelled`, prevents backward transitions after delivery/cancellation, sets `deliveredAt` for Delivered, saves the order, and emails the customer.

## FR-13 — Email Customer Updated Transaction Details

### Requirement
Customer receives the products, subtotal, grand total, and updated transaction details by email.

### Status
`IMPLEMENTED - NEEDS CONFIGURATION`

### Navigation Path

```text
OrdersList.updateStatus()
    ↓
PUT /api/v1/admin/order/:id
    ↓
updateOrder()
    ↓
notifyOrder(order, order.user, subject)
    ↓
message includes order products, quantities, line totals, subtotal, grand total
    ↓
sendEmail()
    ↓
SMTP customer email
```

The same `notifyOrder` path runs after `newOrder`. If `SMTP_HOST` is absent, `sendEmail` returns without sending. Email failures are logged and intentionally do not fail the order/status response.

## FR-14 — PDF Receipt Attached to Email

### Requirement
A PDF receipt containing the transaction details is attached to the customer email.

### Status
`IMPLEMENTED - NEEDS CONFIGURATION`

`receiptPdf.js` uses PDFKit and resolves a `Buffer`. `notifyOrder` passes it to Nodemailer as `attachments: [{ filename, content: receipt, contentType: 'application/pdf' }]`. The PDF contains order, date, status, customer, products, line totals, subtotal, tax, shipping, grand total, and payment method.

## FR-15 — Bad Words Filter

### Requirement
Review text is filtered before storage.

### Status
`COMPLETED`

There is no `bad-words` package in the actual implementation. `backend/utils/profanityFilter.js` defines English/Filipino blocked terms and masks matching characters with asterisks. `createOrUpdateReview` applies `maskProfanity` to the authenticated user's name and submitted comment. It masks content; it does not reject the request.

## FR-16 — Product CRUD Validation

### Requirement
Product forms validate before API submission.

### Status
`PARTIALLY IMPLEMENTED`

`NewProduct` and `UpdateProduct` call `validate(productSchema, ...)` from `frontend/src/Utils/validation.js`. The schema validates name, slug, brand, SKU, price, stock, and description. Backend Mongoose validation also provides required fields, numeric bounds, category enum, and image structure. `specs` JSON parsing in `newProduct` can produce a generic error for malformed input, and some form fields are not covered by the client schema.

## FR-17 — User Login Validation

### Requirement
User login input is validated.

### Status
`COMPLETED`

`Login.submit` calls `validate(loginSchema, { email, password })` before `signInWithEmailAndPassword`. The browser inputs also specify email/password types. Firebase remains the authentication authority.

## FR-18 — Update Profile Validation

### Requirement
Profile update input is validated.

### Status
`PARTIALLY IMPLEMENTED`

`Profile.jsx` sends name/avatar to `/me/update`, but no Yup profile schema or Formik/React Hook Form flow was found. HTML input requirements and backend model constraints provide only limited validation.

## FR-19 — CSS/UI

### Requirement
Application has an implemented UI and responsive styling.

### Status
`COMPLETED`

Active styling is custom CSS in `App.css`, `index.css`, `Admin.css`, `AdminImages.css`, `HomeFilters.css`, `ProductMedia.css`, and `Profile.css`. React Toastify provides notifications. The active app does not use MUI/Data Grid, Bootstrap, or Tailwind utility components despite some packages/configuration being present.

## FR-20 — Sales Charts

### Requirement
Admin can view sales charts with date filtering.

### Status
`COMPLETED`

`DashboardOverview` loads summary stats. `MonthlySalesChart` has start/end date inputs and calls `/admin/sales-per-month`; `ProductSalesChart` calls `/admin/product-sales`; `UserSalesChart` calls `/admin/customer-sales`. Backend aggregation occurs in `order.js` using MongoDB aggregation pipelines. Recharts renders the line/bar charts.

## FR-21 — Pagination

### Requirement
Product results are paginated.

### Status
`COMPLETED`

`Home.getProducts(nextPage)` sends `page`. `APIFeatures.pagination(12)` uses `limit(12)` and `skip(12 * (page - 1))`. There is no numbered pagination control; the user experience is infinite scroll.

## FR-22 — Infinite Scroll

### Requirement
Additional products load while scrolling.

### Status
`COMPLETED`

`Home` registers a `scroll` event. Near the bottom, if `hasMore` and no load is active, it requests `page + 1` with `append=true`. `productActions.getProducts` dispatches `productsAppend`, and the reducer appends products.

## FR-23 — Social Login

### Requirement
User can log in with Google/Facebook.

### Status
`PARTIALLY IMPLEMENTED`

Google login is implemented in `Login.googleLogin` using Firebase `GoogleAuthProvider` and `signInWithPopup`. Facebook login was not found. The provider callback calls `finishLogin`, obtains an ID token, synchronizes the MongoDB user, and stores authenticated state. Other social providers are `NOT IMPLEMENTED`.

## FR-24 — Product/Service CRUD Grading Requirement

### Requirement
Product/Service CRUD with data tables, multiple photos, and bulk checkbox deletion.

### Status
Product side `COMPLETED`; Service side `NOT IMPLEMENTED`.

There is no `Service` model, controller, route, admin component, or API. Product navigation is covered by FR-01, FR-02, and FR-03.

---

# 7. Data Models and Database Flow

## User model

`backend/models/user.js` stores `firebaseUid`, name, lowercase unique email, avatar `{ public_id, url }`, role (`user`/`admin`), and timestamps. Authentication identifies the MongoDB user through Firebase UID.

## Product model / MongoDB products collection

`backend/models/product.js` stores name, slug, brand, model, description, price, salePrice, stock, SKU, category enum, nested specs, compatible models, Cloudinary images, aggregate ratings, review count, embedded reviews, seller, and optional user.

## Order model / MongoDB orders collection

`backend/models/order.js` stores shipping information, embedded `orderItems`, user reference, payment info, item/tax/shipping/total prices, order status, and timestamps. `orderItems` preserve name, quantity, price, image, and product reference at transaction time.

## Product flow

```text
NewProduct or UpdateProduct
    ↓
FormData
    ↓
Multer memory buffer
    ↓
Cloudinary upload
    ↓
Product.create/product.save
    ↓
MongoDB products
    ↓
API product response
    ↓
ProductsList/Home/ProductDetails
```

## Review flow

```text
Delivered order item
    ↓
ListOrders review form
    ↓
PUT /review
    ↓
Delivered Order.findOne ownership/eligibility check
    ↓
Product.reviews embedded subdocument
    ↓
Product.save and aggregate rating update
    ↓
success toast/local submitted state
```

Public review rendering is incomplete: `ProductDetails` loads the product but does not call `/reviews`, and `ListReviews` is a placeholder.

## Transaction flow

```text
Product card
    ↓
App.addItemToCart
    ↓
cartItems in localStorage
    ↓
Cart → Shipping → ConfirmOrder → Payment
    ↓
POST /order/new
    ↓
Product price/stock lookup
    ↓
Order.create + stock decrement
    ↓
Email/PDF side effect
    ↓
OrderSuccess
```

## Authentication flow

```text
Login/Register Firebase SDK
    ↓
Firebase ID token
    ↓
POST /users/sync
    ↓
Firebase Admin verifyIdToken
    ↓
User.findOne({ firebaseUid }) or sync/create
    ↓
helpers.authenticate stores token/user
    ↓
Bearer token on protected Axios requests
    ↓
isAuthenticatedUser + authorizeRoles
```

---

# 8. Dependency Maps

## Product CRUD

```text
Dashboard.jsx
├── ProductsList.jsx
├── NewProduct.jsx
├── UpdateProduct.jsx
├── routes/product.js
├── controllers/product.js
├── utils/multer.js
├── utils/cloudinary.js
└── models/product.js
```

## Reviews and ratings

```text
Order/ListOrders.jsx
├── actions through Axios
├── routes/product.js
├── controllers/product.js
├── utils/profanityFilter.js
└── models/product.js (embedded reviews + ratings)
```

## Transactions

```text
App.jsx
├── Cart/Cart.jsx
├── Cart/Shipping.jsx
├── Cart/ConfirmOrder.jsx
├── Cart/Payment.jsx
├── routes/order.js
├── controllers/order.js
└── models/order.js + models/product.js
```

## Email and PDF

```text
controllers/order.js
├── utils/receiptPdf.js
├── utils/sendEmail.js
├── PDFKit
└── Nodemailer SMTP
```

## Authentication

```text
User/Login.jsx + Register.jsx
├── firebase.js
├── Firebase Auth SDK
├── actions/userActions.jsx
├── Utils/helpers.jsx
├── routes/auth.js
├── middlewares/auth.js
├── config/firebaseAdmin.js
└── models/user.js
```

## Filters and pagination

```text
Home.jsx
├── actions/productActions.jsx
├── reducers/productReducers.jsx
├── routes/product.js
├── controllers/product.js
└── utils/apiFeatures.js
```

## Charts

```text
DashboardOverview.jsx / chart components
├── Axios admin analytics calls
├── routes/order.js
├── controllers/order.js aggregation pipelines
└── Recharts
```

## Service domain

```text
NOT IMPLEMENTED
```

No service dependency map can be provided because no service code exists.

---

# 9. Feature Navigation Index

| Functionality | Start here | Main identifiers | Backend anchor | Search keywords |
|---|---|---|---|---|
| Storefront products | `frontend/src/Components/Home.jsx` | `Home`, `getProducts`, `ProductCard` | `getProducts` | `ProductCard`, `fetchProducts`, `/products` |
| Product CRUD | `frontend/src/Components/Admin/ProductsList.jsx` | `loadProducts`, `removeProduct`, `bulkDelete` | `newProduct`, `updateProduct`, `deleteProduct` | `ProductsList`, `bulkDeleteProducts` |
| Multiple photos | `frontend/src/Components/Admin/NewProduct.jsx` | `FormData`, `images` | `upload.array`, `uploadBuffer` | `upload.array('images', 10)`, `uploadBuffer` |
| Bulk delete | `frontend/src/Components/Admin/ProductsList.jsx` | `selected`, `toggleAll`, `bulkDelete` | `bulkDeleteProducts` | `/admin/products/bulk`, `ids` |
| Price filter | `frontend/src/Components/Home.jsx` | `maxPrice`, `price[lte]` | `APIFeatures.filter` | `price[lte]`, `setMaxPrice` |
| Category filter | `frontend/src/Components/Home.jsx` | `category`, `setCategory` | `APIFeatures.filter` | `All categories`, `setCategory` |
| Ratings filter | `frontend/src/Components/Home.jsx` | `rating`, `setRating` | `ratings`, `$gte` | `Minimum rating`, `rating: gte` |
| Review filter | No active implementation | `NOT IMPLEMENTED` | No filter endpoint | `ProductReviews`, `reviews` |
| Submit/update review | `frontend/src/Components/Order/ListOrders.jsx` | `submitReview`, `change` | `createOrUpdateReview` | `PUT /review`, `existing` |
| Admin delete review | `frontend/src/Components/Admin/ProductReviews.jsx` | `remove` | `deleteReview` | `getAdminReviews`, `deleteReview` |
| Cart | `frontend/src/App.jsx`, `frontend/src/actions/cartActions.jsx` | `addToCart`, `removeFromCart`, `updateCartQuantity`, `clearCart` | none until checkout | `cartItems`, `shippingInfo` in `cartReducers` |
| Order creation | `frontend/src/Components/Cart/Payment.jsx` | `submit` | `newOrder` | `/order/new`, `itemsPrice` |
| Status update | `frontend/src/Components/Admin/OrdersList.jsx` | `updateStatus` | `updateOrder` | `nextStatuses`, `orderStatus` |
| Email | `backend/controllers/order.js` | `notifyOrder` | side effect | `sendEmail`, `SMTP_HOST` |
| PDF | `backend/utils/receiptPdf.js` | exported PDF promise | side effect | `PDFDocument`, `receiptPdf` |
| Auth | `frontend/src/Components/User/Login.jsx` | `finishLogin`, `googleLogin` | `isAuthenticatedUser` | `getIdToken`, `verifyIdToken` |
| Profile | `frontend/src/Components/User/Profile.jsx` | profile submit | `updateProfile` | `/me/update`, `avatar` |
| Charts | `frontend/src/Components/Admin/MonthlySalesChart.jsx` | `load` | `salesPerMonth` | `LineChart`, `sales-per-month` |
| Pagination | `frontend/src/Components/Home.jsx` | `page`, `hasMore` | `pagination` | `productsAppend`, `skip` |
| Infinite scroll | `frontend/src/Components/Home.jsx` | `onScroll`, `getProducts(page + 1, true)` | `pagination` | `document.documentElement.scrollHeight` |
| Google login | `frontend/src/Components/User/Login.jsx` | `googleLogin` | `/users/sync` | `GoogleAuthProvider`, `signInWithPopup` |
| Facebook login | No implementation | `NOT IMPLEMENTED` | none | `FacebookAuthProvider` absent |
| Service CRUD | No implementation | `NOT IMPLEMENTED` | none | `Service` absent |

---

# 10. Important File-by-File Documentation

## `frontend/src/App.jsx`

**Purpose:** Application shell, cart/shipping persistence, dark mode, navigation, route declaration, and lazy admin loading.

**Important functions:**

- `addItemToCart(product, quantity)`: merges by product ID or pushes a cart item.
- `removeItemFromCart(id)`: removes a product from local cart state.
- `updateCartQuantity(id, quantity)`: clamps quantity to at least one.
- `clearCart()`: empties cart after order creation.
- `signOut()`: signs out Firebase, clears Redux/auth/cart/shipping state, navigates home.

**Side effects:** writes `cartItems`, `shippingInfo`, and `darkMode` to local storage. Passes cart handlers to cart/checkout components.

## `frontend/src/Components/Home.jsx`

**Purpose:** Catalog UI and all storefront product filters.

**Important functions/state:** `getProducts`, `keyword`, `category`, `batteryType`, `rating`, `maxPrice`, `page`, `hasMore`, `loadingMore`.

**Calls:** `fetchProducts` in `productActions.jsx`. Uses `useEffect` to reload when keyword/category/chemistry/rating/price changes and a `scroll` event for next pages.

## `frontend/src/Components/Admin/ProductsList.jsx`

**Purpose:** Admin product table and product deletion selection.

**Important identifiers:** `products`, `query`, `sort`, `selected`, `loadProducts`, `visibleProducts`, `toggle`, `toggleAll`, `removeProduct`, `bulkDelete`.

**Calls:** Axios admin product endpoints with `getToken()` bearer authorization.

## `backend/controllers/product.js`

**Purpose:** Product reads, writes, image operations, reviews, and admin review listing.

**Important functions:** `getProducts`, `getProduct`, `newProduct`, `updateProduct`, `deleteProduct`, `bulkDeleteProducts`, `deleteProductImage`, `getAdminProducts`, `createOrUpdateReview`, `getProductReviews`, `deleteReview`, `getAdminReviews`.

**Calls:** `Product` Mongoose model, `APIFeatures`, `uploadBuffer`, `deleteImage`, `maskProfanity`, and `Order.findOne` for review eligibility.

## `backend/controllers/order.js`

**Purpose:** Order creation, user/admin reads, status transitions, deletion, analytics, and notification orchestration.

**Important functions:** `notifyOrder`, `newOrder`, `myOrders`, `getOrder`, `getAllOrders`, `updateOrder`, `deleteOrder`, `stats`, `totalSales`, `salesPerMonth`, `productSales`, `customerSales`.

**Calls:** `Product`, `Order`, `receiptPdf`, `sendEmail`, and MongoDB aggregation.

## `backend/middlewares/auth.js`

**Purpose:** Firebase bearer-token authentication and admin authorization.

**Important functions:** `isAuthenticatedUser` and `authorizeRoles`.

**Input/output:** reads `Authorization: Bearer <Firebase ID token>`, sets `req.firebaseUser` and `req.user`, then allows or rejects the request.

## `backend/utils/apiFeatures.js`

**Purpose:** reusable product search, dynamic operators, nested filters, and pagination.

**Important functions:** `search`, `filter`, `pagination`.

**Database effect:** transforms query parameters into a Mongoose `.find(filter).limit().skip()` query.

## `backend/utils/receiptPdf.js`

**Purpose:** creates a PDFKit document in memory and resolves a Buffer.

**Input:** `order`, `customer`.

**Output:** PDF Buffer consumed by `notifyOrder` as a Nodemailer attachment.

## `frontend/src/Utils/validation.js`

**Purpose:** Yup schemas and shared async `validate` helper.

**Actual schemas:** `productSchema`, `loginSchema`.

## `frontend/src/Utils/helpers.jsx`

**Purpose:** token/user/local-storage helpers and toast error/success helpers.

**Important identifiers:** `getToken`, `getUser`, `authenticate`, `logout`, `errMsg`, `successMsg`.

## `frontend/src/store.js`, `actions/*`, `reducers/*`

**Purpose:** Redux store for user, products, cart/shipping, and order state. Product loading and order creation use Redux thunk; cart actions are plain Redux actions.

**Reducer registration:** `store.js` combines `user`, `products`, `cart`, and `order` reducers.

**Cart files:** `actions/cartActions.jsx` and `reducers/cartReducers.jsx` manage add/remove/update/clear cart items and shipping-info actions. The reducer hydrates from localStorage and `App.jsx` persists changes.

**Order files:** `actions/orderActions.jsx` sends `POST /order/new` and dispatches `ORDER_CREATE_REQUEST`, `ORDER_CREATE_SUCCESS`, or `ORDER_CREATE_FAIL`; `reducers/orderReducers.jsx` stores `order`, `loading`, `success`, and `error`.

## `frontend/src/Components/Admin/Dashboard.jsx`

**Purpose:** role-gated admin control room, tabs, editor switching, and chart placement.

**Tabs:** Overview, Products, Users, Orders, Reviews.

---

# 11. Function-by-Function Navigation

## `Home.getProducts`

- **File:** `frontend/src/Components/Home.jsx`
- **Called by:** initial/filter `useEffect`, scroll handler.
- **Calls:** `fetchProducts(params, append)`.
- **Input:** optional `nextPage`, `append`.
- **Output:** updates page, loading state, `hasMore`.
- **Side effect:** API request and product Redux state update.
- **Requirement:** filters, pagination, infinite scroll.

## `ProductsList.bulkDelete`

- **File:** `frontend/src/Components/Admin/ProductsList.jsx`
- **Called by:** Delete selected button.
- **Calls:** `axios.delete('/admin/products/bulk', { data: { ids } })`.
- **Input:** selected product IDs from checkbox state.
- **Output:** removes successful IDs from local list and clears selection.
- **Requirement:** bulk checkbox deletion.

## `createOrUpdateReview`

- **File:** `backend/controllers/product.js`
- **Called by:** `PUT /api/v1/review`.
- **Calls:** `Product.findById`, `Order.findOne`, `maskProfanity`, `product.save`.
- **Input:** authenticated user and `productId`, `rating`, `comment`.
- **Output:** `{ success: true }` or an error.
- **Side effects:** creates/updates embedded review and aggregate rating.
- **Requirement:** review/rating create and own-review update.

## `newOrder`

- **File:** `backend/controllers/order.js`
- **Called by:** `POST /api/v1/order/new`.
- **Calls:** Product lookup, Order.create, stock updates, `notifyOrder`.
- **Input:** shipping info and requested order items.
- **Output:** created order.
- **Side effects:** stock decrement, email/PDF attempt.
- **Risk:** stock check/decrement is not atomic.

## `updateOrder`

- **File:** `backend/controllers/order.js`
- **Called by:** admin `PUT /api/v1/admin/order/:id`.
- **Calls:** status transition checks, save, `notifyOrder`.
- **Input:** order ID and status.
- **Output:** updated order.
- **Side effects:** delivered timestamp and status email/PDF.

## `notifyOrder`

- **File:** `backend/controllers/order.js`
- **Called by:** `newOrder`, `updateOrder`.
- **Calls:** `receiptPdf`, `sendEmail`.
- **Input:** order, customer, subject.
- **Output:** no HTTP value; errors are logged.
- **Side effects:** sends email with text product breakdown and PDF attachment.

## `isAuthenticatedUser`

- **File:** `backend/middlewares/auth.js`
- **Called by:** protected routes.
- **Calls:** Firebase Admin `verifyIdToken`, `User.findOne`.
- **Input:** Authorization header.
- **Output:** `req.firebaseUser`, `req.user`, or 401/next error.

---

# 12. Requirement → Complete Code Paths

## User updates own review/rating

```text
1. Page: frontend/src/Components/Order/ListOrders.jsx
2. Component: ListOrders
3. Handler: submitReview(productId)
4. API: PUT /api/v1/review
5. Route: backend/routes/product.js
6. Middleware: isAuthenticatedUser
7. Controller: createOrUpdateReview
8. Ownership check: embedded review.user === req.user._id
9. Eligibility check: delivered Order.findOne for req.user and product
10. Model: Product, embedded reviews array
11. Database: products collection
12. Response: { success: true }
13. UI: local submitted state and success toast
```

There is no separate `Review` model and no direct review-ID edit route. The product document owns the embedded review.

## Customer transaction email with PDF

```text
1. Page: Admin/OrdersList.jsx or Cart/Payment.jsx
2. Handler: updateStatus() or submit()
3. API: PUT /admin/order/:id or POST /order/new
4. Route: backend/routes/order.js
5. Controller: updateOrder() or newOrder()
6. Service/helper: notifyOrder()
7. PDF: receiptPdf(order, user)
8. Email: sendEmail({ message, attachments })
9. SMTP: Nodemailer transport from environment
10. Customer: email address from User
```

---

# 13. API and Middleware Matrix

| API group | Auth | Role | Validation/business rule | Database operation |
|---|---|---|---|---|
| Public products | none | none | Dynamic query parsing | Product find/filter/pagination |
| Admin products | Firebase token | admin | Mongoose product schema, Multer image rules | Product create/update/delete |
| User review | Firebase token | user | Must own delivered order; schema rating/comment bounds | Embedded Product review update |
| Admin review delete | Firebase token | admin | Product lookup; review filtering | Product save/recalculate rating |
| User orders | Firebase token | user | Product existence/stock on create | Order create/find |
| Admin orders | Firebase token | admin | Allowed status transitions | Order update/delete/analytics |
| User sync/profile | Firebase token | user/sync exception | Firebase UID lookup and Mongoose schema | User upsert/update |

Global async controller wrapper: `backend/utils/catchAsyncErrors.js`. Global response handler: `backend/middlewares/error.js`. Error object: `backend/utils/errorHandler.js`.

---

# 14. Program Execution and Verified Issues

## Verified status

- Frontend production build has passed during the project checks.
- Project-owned backend files used in the email/PDF flow passed `node --check`.
- Runtime MongoDB, Firebase Admin, Cloudinary, and SMTP behavior was not executed in this documentary.

## Actual gaps and risks found

| Issue | Location | Impact | Status |
|---|---|---|---|
| Service domain absent | repository-wide | Service CRUD cannot be navigated or graded as implemented. | NOT IMPLEMENTED |
| Review filter absent | `ProductReviews.jsx`, product routes | Admin reviews cannot be searched/filtered. | NOT IMPLEMENTED |
| Review edit form hidden after submit | `Order/ListOrders.jsx` | User has no direct edit control in the same session. | IMPLEMENTED - NEEDS FIX |
| Product details does not render reviews | `ProductDetails.jsx`, `ListReviews.jsx` | Public review display is incomplete. | NOT IMPLEMENTED/PARTIAL |
| Admin review delete does not explicitly fail for unknown review ID | `deleteReview` | A non-matching ID can return success. | IMPLEMENTED - NEEDS FIX |
| Online payment absent | `Payment.jsx`, `newOrder` | Only COD is supported. | NOT IMPLEMENTED |
| SMTP absent silently disables email | `sendEmail.js` | Orders can succeed without customer email. | IMPLEMENTED - NEEDS CONFIGURATION |
| Email/PDF failure does not fail order/status request | `notifyOrder` | Customer notification failure is only logged. | IMPLEMENTED - NEEDS CONFIGURATION |
| Stock check/decrement not atomic | `newOrder` | Concurrent orders can oversell stock. | IMPLEMENTED - NEEDS FIX |
| Order deletion always restores stock | `deleteOrder` | Stock can be incorrectly restored for fulfilled/processed orders. | IMPLEMENTED - NEEDS FIX |
| Frontend API URL has no code fallback | component/action calls | Requires `VITE_API_URL` to be configured. | CANNOT VERIFY |
| Environment secrets are local sensitive data | `backend/config/.env` | Must not be committed or exposed; rotate any leaked active credentials. | SECURITY ACTION |

No unverified error should be inferred from a package merely being installed. The statuses above are based on actual code paths and static inspection.

---

# 15. Project Contribution Summary

## Product catalog and administration

- **Purpose:** browse and manage UPS products.
- **Frontend:** `Home.jsx`, `ProductDetails.jsx`, `Admin/ProductsList.jsx`, `NewProduct.jsx`, `UpdateProduct.jsx`.
- **Backend:** product routes/controller/model.
- **Database:** MongoDB `products` collection through Mongoose.
- **External services:** Cloudinary for images.

## Reviews and ratings

- **Purpose:** delivered customers can create/update ratings and comments; admins can list/delete reviews.
- **Frontend:** `Order/ListOrders.jsx`, `Admin/ProductReviews.jsx`.
- **Backend:** `createOrUpdateReview`, `getAdminReviews`, `deleteReview`.
- **Database:** embedded `reviews`, `ratings`, and `numOfReviews` in Product.
- **External services:** none; custom profanity masking.

## Checkout and transactions

- **Purpose:** cart, shipping, confirmation, COD order creation, order history.
- **Frontend:** `App.jsx`, Cart components, Order components.
- **Backend:** order routes/controller/model.
- **Database:** `orders` and updated product stock.
- **External services:** SMTP/PDF notification attempt.

## Authentication

- **Purpose:** Firebase identity, MongoDB user synchronization, protected/admin endpoints.
- **Frontend:** `firebase.js`, Login/Register/Profile/password pages, helpers.
- **Backend:** Firebase Admin, auth middleware/controller/routes.
- **Database:** User collection.
- **External service:** Firebase Authentication.

## Analytics

- **Purpose:** admin totals and sales charts.
- **Frontend:** Dashboard overview and three Recharts components.
- **Backend:** aggregation handlers in `order.js`.
- **Database:** orders aggregation.

---

# 16. Quick Navigation Cheat Sheet

```text
PRODUCTS:
Start at → frontend/src/Components/Home.jsx
Admin CRUD → frontend/src/Components/Admin/ProductsList.jsx

REVIEWS:
Start at → frontend/src/Components/Order/ListOrders.jsx
Admin review management → frontend/src/Components/Admin/ProductReviews.jsx

RATINGS:
Filter → frontend/src/Components/Home.jsx
Create/update → backend/controllers/product.js:createOrUpdateReview

TRANSACTIONS:
Start at → frontend/src/Components/Cart/Payment.jsx
Backend → backend/controllers/order.js:newOrder

EMAIL:
Start at → backend/controllers/order.js:notifyOrder

PDF:
Start at → backend/utils/receiptPdf.js

AUTHENTICATION:
Start at → frontend/src/Components/User/Login.jsx
Backend guard → backend/middlewares/auth.js:isAuthenticatedUser

FILTERS:
Start at → frontend/src/Components/Home.jsx
Backend parser → backend/utils/apiFeatures.js

VALIDATION:
Product/login → frontend/src/Utils/validation.js
Database constraints → backend/models/product.js and other models

CHARTS:
Start at → frontend/src/Components/Admin/DashboardOverview.jsx
Chart components → MonthlySalesChart.jsx, ProductSalesChart.jsx, UserSalesChart.jsx

PAGINATION:
Frontend → frontend/src/Components/Home.jsx
Backend → backend/utils/apiFeatures.js:pagination

INFINITE SCROLL:
Start at → frontend/src/Components/Home.jsx scroll handler

SOCIAL LOGIN:
Google → frontend/src/Components/User/Login.jsx:googleLogin
Facebook → NOT IMPLEMENTED

SERVICE CRUD:
NOT IMPLEMENTED
```

---

# Final Code Navigation Summary

1. The frontend is organized around `App.jsx`, route components, feature folders, Redux actions/reducers, and shared helpers.
2. The backend is organized around Express routes, controllers, Mongoose models, middleware, and utility modules.
3. Frontend Axios calls use `VITE_API_URL` and send Firebase bearer tokens for protected operations.
4. Backend uses Firebase Admin for identity and Mongoose for MongoDB persistence.
5. Product CRUD, multiple image uploads, bulk checkbox deletion, price/category/rating filters, pagination, and infinite scroll are implemented.
6. Reviews are embedded in products; delivered-order eligibility and user ownership are checked server-side.
7. Ratings are aggregate Product fields recalculated after review create/update/delete.
8. Transactions are COD-only and persist order item snapshots and totals.
9. Admins update order status through `OrdersList` and `updateOrder`.
10. Order creation/status updates call `notifyOrder`, which composes email text and PDF attachment.
11. PDF receipts use PDFKit and email delivery uses Nodemailer SMTP.
12. Validation is a combination of frontend Yup for product/login and backend Mongoose constraints; profile/shipping validation is limited.
13. Active UI uses custom CSS and Recharts; installed MUI/Data Grid, Bootstrap, and SweetAlert2 are not active implementation evidence.
14. Sales charts use protected order aggregation endpoints and Recharts.
15. Pagination is server-side at 12 products/page, exposed through a frontend infinite-scroll event.
16. Google login is implemented with Firebase; Facebook login is not.
17. No Service model or Service CRUD flow exists.

This document is the navigation companion to `CRUD_FEATURES.md`, which contains the shorter feature-status inventory and recently verified feature locations.
