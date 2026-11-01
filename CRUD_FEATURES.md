# ITCP318 CRUD and Feature Documentary

## Project context

This document explains the feature requirements implemented in the UPS Battery
Store. It is intentionally focused on code navigation: where a feature starts,
which component handles it, which request is sent, which backend route and
controller receive it, how the model is changed, and how the response returns
to the UI.

The application has a **Product** domain. It does not have a separate Service
model or Service CRUD domain.

The master documentation for the complete application is
[`CODE_DOCUMENTARY.md`](./CODE_DOCUMENTARY.md). This file is the focused
documentary for the CRUD, filtering, reviews, transactions, validation, UI,
analytics, pagination, authentication, and Redux feature paths.

## How to read a feature path

Most feature flows follow this pattern:

```text
React page/component
  -> local state or Redux action
  -> Axios request
  -> Express route
  -> authentication/upload middleware
  -> controller
  -> Mongoose model and MongoDB
  -> JSON response
  -> component state or Redux reducer
  -> updated UI
```

Authentication is handled with Firebase. The frontend obtains a Firebase ID
token and sends it as a bearer token. The backend verifies the token in
`backend/middlewares/auth.js`, then loads the application user from MongoDB.
Admin routes additionally use `authorizeRoles("admin")`.

---

# Requirement order and implementation status

The sections below follow the functional-requirement order: MP1, MP2, MP3,
Term Test Lab, Unit 1, Unit 2, Quizzes 1-4, and Term Test LEC. `Implemented`
means an actual code path was found. `Partial` means the main path exists but
has a documented limitation. `Not implemented` means no corresponding active
code path was found.

| Requirement area | Main code path | Status |
|---|---|---|
| MP1 Product CRUD table | `Admin/ProductsList.jsx` → product routes/controller/model | Implemented |
| MP1 Multiple photo upload | `NewProduct.jsx`/`UpdateProduct.jsx` → Multer → Cloudinary | Implemented |
| MP1 Bulk delete checkboxes | `ProductsList.jsx` → `bulkDeleteProducts` | Implemented |
| MP2 Price/category/rating filters | `Home.jsx` → `apiFeatures.js` | Implemented |
| MP2 Review filter | `ProductReviews.jsx` | Not implemented |
| MP3 Customer review/rating | `ListOrders.jsx` → `createOrUpdateReview` | Implemented |
| MP3 Own review/rating update | Same review endpoint with owner check | Partial; edit UI is limited |
| MP3 Admin review delete | `ProductReviews.jsx` → `deleteReview` | Implemented with validation gap |
| Term Test Lab transaction | Cart → checkout → `newOrder` | Partial; COD only |
| Term Test Lab order status | `OrdersList.jsx` → `updateOrder` | Implemented |
| Term Test Lab email/PDF | `notifyOrder` → SMTP and PDFKit | Implemented; requires SMTP |
| Unit 1 profanity masking | `profanityFilter.js` | Implemented with custom filter |
| Unit 1 Yup validation | `validation.js` and form components | Implemented |
| Unit 2 CSS UI | App/admin/product/profile CSS | Implemented |
| Unit 2 Bootstrap UI | No Bootstrap component usage | Not implemented |
| Unit 2 MUI/similar UI | Recharts is used; controls are custom HTML/CSS | Partial |
| Quiz 1 sales charts/date filter | Admin chart components → order aggregations | Partial |
| Quiz 2 pagination/infinite scroll | `Home.jsx` → product API pagination | Implemented |
| Quiz 3 Gmail/Google login | Firebase `GoogleAuthProvider` | Implemented |
| Quiz 3 Facebook login | No `FacebookAuthProvider` path | Not implemented |
| Quiz 4 Redux | `store.js`, actions, reducers | Implemented |
| Term Test LEC completeness | Feature coverage in this document | Partial |
| Term Test LEC execution/errors | Build and static checks; external services required | Cannot fully verify |
| Term Test LEC contribution | UPS product-store implementation | Implemented |

---

# MP1 — Product CRUD, multiple photos, and bulk delete

## MP1.1 Product CRUD data table

## What the feature does

An administrator can view products in a table, create a product, edit a
product, delete one product, and delete selected products in bulk.

## Files and responsibilities

| Layer | File | Responsibility |
|---|---|---|
| Admin entry | `frontend/src/Components/Admin/Dashboard.jsx` | Shows the dashboard tabs and renders `ProductsList` for Products. |
| Product table | `frontend/src/Components/Admin/ProductsList.jsx` | Loads products, renders rows, tracks selection, and starts delete/edit actions. |
| Create form | `frontend/src/Components/Admin/NewProduct.jsx` | Collects product fields and image files, validates, and submits `FormData`. |
| Update form | `frontend/src/Components/Admin/UpdateProduct.jsx` | Loads/edit fields and submits changes plus optional new images. |
| HTTP routes | `backend/routes/product.js` | Maps admin product URLs to controller functions. |
| Controller | `backend/controllers/product.js` | Performs validation, uploads, database writes, and response creation. |
| Model | `backend/models/product.js` | Defines product fields, category values, stock, price, images, and reviews. |

## Read/list flow

```text
Dashboard -> ProductsList
  -> loadProducts()
  -> GET /api/v1/admin/products
  -> isAuthenticatedUser
  -> authorizeRoles("admin")
  -> getAdminProducts()
  -> Product.find()
  -> { products }
  -> ProductsList.setProducts()
  -> HTML product table
```

`ProductsList` keeps the returned products in component state. Search and
sorting in the table are client-side operations over that loaded list. The
table is a native HTML table styled by `frontend/src/Components/Admin/Admin.css`;
it is not a MUI Data Grid.

## Create flow

```text
NewProduct form
  -> React form state
  -> validate(productSchema, form values)
  -> FormData.append(field, value)
  -> FormData.append("images", each selected file)
  -> POST /api/v1/admin/product/new
  -> upload.array("images", 10)
  -> newProduct()
  -> uploadBuffer() for every file
  -> Product.create()
  -> MongoDB products collection
  -> response
  -> ProductsList refreshes
```

The server is the final authority for the stored product. The product schema
also validates field types and allowed values. Images are stored as Cloudinary
objects containing `public_id` and `url`, not as binary data in MongoDB.

## Update flow

```text
ProductsList edit action
  -> UpdateProduct receives product ID
  -> GET product data / existing product state
  -> edit fields and optional new images
  -> validate(productSchema, values)
  -> PUT /api/v1/admin/product/:id
  -> upload.array("images", 10)
  -> updateProduct()
  -> update regular fields
  -> upload new image buffers to Cloudinary
  -> append new image references
  -> product.save()
  -> updated product response
```

An existing image can be removed separately:

```text
UpdateProduct image delete
  -> DELETE /api/v1/admin/product/:id/image/:imageId
  -> deleteProductImage()
  -> remove image from Product.images
  -> deleteImage(public_id) in Cloudinary
  -> save product
```

## Single delete flow

```text
ProductsList.removeProduct(productId)
  -> DELETE /api/v1/admin/product/:id
  -> admin authentication and role checks
  -> deleteProduct()
  -> Product.findById()
  -> Product.findByIdAndDelete()
  -> delete every stored Cloudinary image
  -> success response
  -> remove row or refresh list
```

## Model fields used by CRUD

The main fields are `name`, `slug`, `brand`, `sku`, `description`, `price`,
`salePrice`, `stock`, `category`, `specs`, and `images`. The same Product
document also owns the embedded `reviews`, `ratings`, and `numOfReviews`
fields described later.

---

## MP1.2 Multiple product photo upload

## Frontend path

`NewProduct.jsx` and `UpdateProduct.jsx` use a file input with `multiple`.
Each selected file is appended with the same `images` field name:

```text
file input
  -> images state array
  -> FormData.append("images", file)
  -> multipart request
```

## Backend path

```text
backend/routes/product.js
  -> upload.array("images", 10)
  -> backend/utils/multer.js
  -> memory buffers in req.files
  -> backend/utils/cloudinary.js: uploadBuffer()
  -> Product.images = [{ public_id, url }, ...]
```

The upload middleware accepts JPEG, PNG, and WebP files and limits each file
to 5 MB. The route allows a maximum of 10 files per request. Cloudinary
deletion is also called when a product or individual image is removed.

---

## MP1.3 Bulk delete with checkboxes

## Frontend flow

`ProductsList.jsx` keeps selected product IDs in the `selected` array.

```text
row checkbox
  -> toggle(productId)
  -> selected state

select-all checkbox
  -> toggleAll()
  -> IDs of currently visible/filtered rows

Delete selected button
  -> bulkDelete()
  -> window confirmation
  -> DELETE /api/v1/admin/products/bulk
       body: { ids: ["product-id-1", "product-id-2"] }
```

The select-all operation applies to the currently visible filtered rows; it
does not automatically select products that are not in the current table view.

## Backend flow

```text
DELETE /api/v1/admin/products/bulk
  -> isAuthenticatedUser
  -> authorizeRoles("admin")
  -> bulkDeleteProducts()
  -> Product.find({ _id: { $in: ids } })
  -> Product.deleteMany({ _id: { $in: ids } })
  -> delete stored Cloudinary images
  -> return success
```

After success, the frontend removes the deleted rows from local state and
clears the selection.

---

# MP2 — Filter functions

All homepage filters start in
`frontend/src/Components/Home.jsx`. The selected state is included in
`URLSearchParams`, and the effect calls `getProducts()` whenever a filter
changes.

```text
filter control
  -> set filter state
  -> Home useEffect
  -> getProducts()
  -> fetchProducts() in frontend/src/actions/productActions.jsx
  -> GET /api/v1/products?filter=value
  -> getProducts() controller
  -> APIFeatures.search().filter().pagination()
  -> Product.find(query)
  -> productReducers.jsx
  -> product cards
```

## MP2.1 Price filter

The maximum-price range input uses `maxPrice` from PHP 0 to PHP 160,000 in
PHP 500 steps and sends `price[lte]`.

```text
setMaxPrice()
  -> ?price[lte]=160000
  -> apiFeatures.js parses lte
  -> { price: { $lte: 160000 } }
  -> Product.find()
```

This filters the stored base `price`. The product card may display
`salePrice || price`, so the filter does not independently calculate a
sale-price threshold.

## MP2.2 Category filter

`Home.jsx` defines the category buttons and sends the selected value as
`category`.

```text
category button
  -> setCategory(categoryName)
  -> ?category=Replacement%20Batteries
  -> APIFeatures.filter()
  -> exact Product.category match
```

The accepted category values are defined in the Product schema.

## MP2.3 Ratings filter

The UI offers `Any rating`, `4+ stars`, and `4.5+ stars`.

```text
setRating("4")
  -> ?rating=gte:4
  -> apiFeatures.js maps rating to ratings
  -> { ratings: { $gte: 4 } }
  -> product cards with matching aggregate ratings
```

`ratings` is the aggregate value calculated from the Product document's
embedded reviews.

## MP2.4 Review-record filter

There is currently no review filter implementation. The admin review screen
loads reviews and supports deletion, but it does not provide review search,
product filtering, rating filtering, or a filter query endpoint. This is
different from the product **ratings** filter above.

---

# MP3 — Review and rating functions

## Data structure

There is no separate Review model. Reviews are embedded in `Product`:

```text
Product
  -> reviews[]
       -> user
       -> name
       -> rating
       -> comment
  -> ratings
  -> numOfReviews
```

The controller recalculates `ratings` and `numOfReviews` whenever a review is
created, updated, or deleted.

## Customer create review/rating flow

The review form is shown in `frontend/src/Components/Order/ListOrders.jsx`
for a product in a Delivered order.

```text
delivered order item
  -> rating and comment inputs
  -> submitReview(productId)
  -> PUT /api/v1/review
       { productId, rating, comment }
  -> isAuthenticatedUser
  -> createOrUpdateReview()
  -> Product.findById(productId)
  -> Order.findOne({
       user: req.user._id,
       orderStatus: "Delivered",
       "orderItems.product": productId
     })
  -> maskProfanity()
  -> add embedded review
  -> calculate average rating
  -> product.save()
  -> success response and toast
```

The backend eligibility check is important: the frontend display condition is
not the security control. The server verifies both ownership of the order and
the Delivered status.

## Customer update own review/rating

The same `PUT /api/v1/review` endpoint handles create and update.

```text
existing Product review
  -> find review where review.user == req.user._id
  -> Object.assign(existingReview, new rating/comment)
  -> recalculate ratings and numOfReviews
  -> product.save()
```

The backend ownership check prevents one user from updating another user's
review. Current UI limitation: after successful submission,
`ListOrders.jsx` hides the form for that local session. Reloading the orders
screen permits another submission, which the backend treats as an update.

## Admin delete review flow

```text
Dashboard Reviews tab
  -> ProductReviews.jsx
  -> DELETE /api/v1/reviews
       { productId, id }
  -> isAuthenticatedUser
  -> authorizeRoles("admin")
  -> deleteReview()
  -> filter Product.reviews
  -> recalculate ratings and numOfReviews
  -> product.save()
  -> local review row removed
```

The active delete path exists. A validation gap remains in the backend:
an unknown embedded review ID is not explicitly rejected before saving the
unchanged product.

## Review display and filtering limitation

`backend/controllers/product.js` has product/admin review retrieval paths, but
the current product-detail UI does not fully render public reviews and
`frontend/src/Components/Review/ListReviews.jsx` is only a placeholder.

---

# Term Test Lab — Transactions and order status

## Customer checkout flow

```text
Home/ProductDetails
  -> App.addItemToCart()
  -> Redux cart reducer
  -> localStorage.cartItems
  -> Cart.jsx
  -> Shipping.jsx
  -> ConfirmOrder.jsx
  -> Payment.jsx
  -> POST /api/v1/order/new
  -> isAuthenticatedUser
  -> newOrder()
  -> load products from MongoDB
  -> verify stock and use server prices
  -> Order.create()
  -> decrement product stock
  -> notifyOrder()
  -> OrderSuccess.jsx
```

The backend does not trust client totals. It loads each Product, validates
stock, calculates line totals, tax, shipping, and grand total, then stores
the order in MongoDB. The implemented payment method is Cash on Delivery;
online payment processing is not present.

## Admin status update

```text
Dashboard Orders tab
  -> OrdersList.updateStatus(orderId, status)
  -> PUT /api/v1/admin/order/:id
       { orderStatus }
  -> auth + admin middleware
  -> updateOrder()
  -> validate allowed status transition
  -> set deliveredAt when Delivered
  -> order.save()
  -> notifyOrder()
  -> updated order response
```

Allowed statuses are `Processing`, `Shipped`, `Delivered`, and `Cancelled`.
The controller prevents invalid backward transitions after final states.

## Order model

`backend/models/order.js` stores shipping data, user reference, embedded
`orderItems`, payment method, item price, tax, shipping, total price, status,
and timestamps. Each order item keeps the product name, quantity, price, image,
and product reference as a snapshot of the transaction.

---

## Term Test Lab.1 Customer email and PDF receipt

Both new-order creation and admin status updates call `notifyOrder()` in
`backend/controllers/order.js`.

```text
newOrder() / updateOrder()
  -> notifyOrder(order, user, subject)
  -> create receipt buffer in utils/receiptPdf.js
  -> build email text with products and totals
  -> sendEmail() in utils/sendEmail.js
  -> Nodemailer SMTP transport
  -> customer email
```

The email includes product names, quantities, line subtotals, subtotal, and
grand total. The PDF attachment includes order/customer details, status,
products, line totals, subtotal, tax, shipping, grand total, and payment
method.

SMTP must be configured in the backend environment. If SMTP is not configured,
the order/status operation can still succeed while the email attempt is
skipped or logged.

---

# Unit 1 — Bad-word masking and form validation

## Unit 1.1 Bad-word masking

The project uses a custom filter, not the `bad-words` npm package.

```text
review name/comment
  -> createOrUpdateReview()
  -> maskProfanity() in backend/utils/profanityFilter.js
  -> replace matched characters with asterisks
  -> save masked values
```

The filter defines English and Filipino blocked terms, uses a
Unicode-aware regular expression, and also masks returned review values in
the review retrieval controllers.

---

## Unit 1.2 Form validation

Shared schemas are in `frontend/src/Utils/validation.js`. The `validate`
helper runs Yup with `abortEarly: false`, so multiple field errors can be
returned together.

| Form | Component | Schema |
|---|---|---|
| Create product | `Admin/NewProduct.jsx` | `productSchema` |
| Update product | `Admin/UpdateProduct.jsx` | `productSchema` |
| User login | `User/Login.jsx` | `loginSchema` |
| Update profile | `User/Profile.jsx` | `profileSchema` |

```text
submit
  -> validate(schema, values)
  -> show validation error
  -> stop request when invalid
  -> continue to Firebase/API only when valid
```

Yup is used directly with React state and native form events. Formik and React
Hook Form are not used in the current implementation.

---

# Unit 2 — User interface design

The active UI uses React, native HTML controls, and custom CSS:

- `frontend/src/App.css`: storefront shell, navigation, cards, filters,
  loading spinner, responsive layout.
- `frontend/src/index.css`: global reset and base styles.
- `frontend/src/Components/Admin/Admin.css`: dashboard, tables, panels,
  forms, and responsive admin layout.
- `frontend/src/Components/Admin/AdminImages.css`: product image manager.
- `frontend/src/Components/Product/ProductMedia.css`: product imagery.
- `frontend/src/Components/HomeFilters.css`: homepage filter controls.
- `frontend/src/Components/User/Profile.css`: profile page styling.

Recharts is used for charts and React Toastify for notifications. Bootstrap
components and active MUI/Data Grid components are not used by the current
screen implementations, even though related packages may be listed in the
frontend manifest.

---

# Quiz 1 — Sales charts with date range

The dashboard chart components call admin analytics endpoints:

```text
DashboardOverview / chart component
  -> Axios request with Firebase token
  -> backend/routes/order.js
  -> aggregation controller in backend/controllers/order.js
  -> MongoDB orders aggregation
  -> Recharts line/bar chart
```

`MonthlySalesChart.jsx` exposes a start/end date filter and renders a line
chart. `ProductSalesChart.jsx` and `UserSalesChart.jsx` render bar charts but
do not expose the same date inputs in their current UI.

---

# Quiz 2 — Product pagination and infinite scroll

## Pagination

The backend product list uses 12 records per page:

```text
Home.page
  -> ?page=1
  -> APIFeatures.pagination(12)
  -> Product.find().limit(12).skip(...)
  -> products + resPerPage
```

`Home.jsx` stores `page` and uses `resPerPage` to determine whether another
page may exist.

## Infinite scroll

```text
window scroll
  -> near document bottom
  -> getProducts(page + 1, true)
  -> fetchProducts(..., append=true)
  -> productsAppend action
  -> reducer appends products
  -> product grid grows without a full page navigation
```

The request uses an `AbortController` for a new non-append filter request and
ignores cancellation errors.

---

# Quiz 3 — Firebase Google login

```text
Login.jsx googleLogin()
  -> signInWithPopup(auth, GoogleAuthProvider)
  -> Firebase user.getIdToken()
  -> POST /api/v1/users/sync
  -> Firebase Admin verifyIdToken()
  -> syncUser() in MongoDB
  -> helpers.authenticate()
  -> Redux loginSuccess()
  -> navigate home or dashboard by role
```

`frontend/src/firebase.js` reads the Firebase web configuration from
`VITE_FIREBASE_*` environment values. Facebook login is not implemented:
there is no `FacebookAuthProvider` or Facebook login handler.

---

# Quiz 4 — Redux state management

The store is configured in `frontend/src/store.js` with reducers and thunk.

| State area | Reducer | Main use |
|---|---|---|
| Products | `productReducers.jsx` | Product list, append, selected product, loading, errors. |
| Cart | `cartReducers.jsx` | Cart items and shipping information. |
| Orders | `orderReducers.jsx` | Order creation/loading/success/errors. |
| User | `userReducers.jsx` | Login, logout, authenticated user, loading/errors. |

Async work is dispatched through action modules such as
`productActions.jsx`, `orderActions.jsx`, and `userActions.jsx`. Components
subscribe with `useSelector` and dispatch with `useDispatch`.

---

# MP1 note — Product versus Service domain

The requirement wording mentions Product/Service CRUD, but this repository
contains only Product CRUD:

```text
No Service model
No Service controller
No Service route
No Service admin form
No Service data table
```

Implementing Service CRUD would be a separate feature requiring a new model,
controller, routes, admin screens, and frontend state/API flow. It is not
silently treated as implemented by the existing Product CRUD.

---

# Term Test LEC — Completeness, execution, and contribution

## Functional requirements completeness

The implemented end-to-end product-store flow is:

```text
Firebase login
  -> product catalog and filters
  -> product details
  -> cart
  -> shipping and confirmation
  -> COD order
  -> admin order status
  -> customer email/PDF side effect
  -> delivered-product review/rating
```

The main incomplete or limited areas are:

- There is no separate Service model or Service CRUD.
- Review-record filtering is not implemented.
- Online payment is not implemented; checkout is COD.
- Public product review rendering is incomplete.
- The review form does not show a same-session edit button after submission.
- Facebook login is not implemented.
- Bootstrap components are not used.
- MUI/Data Grid is listed in dependencies, but active UI controls use custom
  HTML/CSS. Recharts is used for charts.
- SMTP email delivery depends on environment configuration.

## Program execution and error handling

### Startup path

```text
backend/server.js
  -> dotenv loads backend/config/.env
  -> app.js configures Express and routes
  -> connectDatabase()
  -> app.listen(PORT)

frontend/index.html
  -> frontend/src/main.jsx
  -> Redux Provider + BrowserRouter
  -> frontend/src/App.jsx
  -> route components
```

### Error path

Frontend API errors are converted to toast messages through
`frontend/src/Utils/helpers.jsx:errMsg`. Backend asynchronous controller errors
are passed through `backend/utils/catchAsyncErrors.js` to
`backend/middlewares/error.js`, which creates the HTTP error response.

The project has verified build/static checks, but live MongoDB, Firebase Admin,
Cloudinary, and SMTP behavior depends on deployment credentials and cannot be
proven by source inspection alone.

### What to check before a demo

```powershell
cd frontend
npm run build

cd ..\backend
node --check server.js
```

Then verify:

1. `GET /api/v1/health` responds successfully.
2. The frontend `VITE_API_URL` points to the deployed API.
3. Backend `CLIENT_URL` points to the deployed frontend.
4. MongoDB Atlas permits the deployed backend.
5. Firebase Authorized Domains contains the frontend host.
6. Cloudinary upload credentials work for product images.
7. SMTP credentials work if email/PDF is being demonstrated.

## Project contribution

The project contribution is an integrated UPS Battery Store rather than an
isolated CRUD screen. It includes:

- customer product catalog with server-side filtering and pagination
- admin product management and Cloudinary image storage
- Firebase email/password and Google authentication
- Redux cart, shipping, product, order, and user state
- COD checkout and stock updates
- admin order processing and analytics
- customer reviews and aggregate product ratings
- profanity masking, Yup validation, email notification, and PDF receipts
- responsive custom CSS interface and loading states

The source-of-truth navigation for each contribution is the feature table at
the beginning of this document and the Quick navigation index below.

---

# Quick navigation index

| Feature | Start file | Backend anchor |
|---|---|---|
| Product table | `frontend/src/Components/Admin/ProductsList.jsx` | `backend/controllers/product.js:getAdminProducts` |
| Create product | `frontend/src/Components/Admin/NewProduct.jsx` | `newProduct` |
| Update product | `frontend/src/Components/Admin/UpdateProduct.jsx` | `updateProduct` |
| Multiple images | `NewProduct.jsx`, `UpdateProduct.jsx` | `utils/multer.js`, `utils/cloudinary.js` |
| Bulk delete | `ProductsList.jsx` | `bulkDeleteProducts` |
| Price/category/rating filters | `frontend/src/Components/Home.jsx` | `utils/apiFeatures.js` |
| Customer review | `frontend/src/Components/Order/ListOrders.jsx` | `createOrUpdateReview` |
| Admin review delete | `frontend/src/Components/Admin/ProductReviews.jsx` | `deleteReview` |
| Checkout | `frontend/src/Components/Cart/Payment.jsx` | `newOrder` |
| Order status | `frontend/src/Components/Admin/OrdersList.jsx` | `updateOrder` |
| Email/PDF | — | `notifyOrder`, `receiptPdf`, `sendEmail` |
| Validation | `frontend/src/Utils/validation.js` | Mongoose schema validation |
| Charts | `frontend/src/Components/Admin/*Chart.jsx` | order analytics controllers |
| Redux | `frontend/src/store.js` | — |
