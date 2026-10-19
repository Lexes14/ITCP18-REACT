# Product/Service CRUD Feature Status

## Summary

| Requirement | Status | Notes |
|---|---|---|
| Product CRUD datatable | Implemented | Admin product list uses a searchable and sortable HTML table with create, edit, and delete actions. |
| Multiple product photo upload | Implemented | Create and update forms accept up to 10 JPEG, PNG, or WebP files per request. Images are stored in Cloudinary. |
| Bulk delete with checkboxes | Implemented | Admins can select individual products or all visible filtered products, then delete them in one request. |
| Product price filter | Implemented | The storefront has a maximum-price slider backed by the public products API. |
| Product category filter | Implemented | The storefront provides category buttons and filters products through the public products API. |
| Product ratings filter | Implemented | The storefront filters products by minimum rating: 4+ or 4.5+ stars. |
| Review filter | Not implemented | Reviews can be listed and deleted in the admin area, but there is no review search, product filter, rating filter, or filter query endpoint. |
| User review/rating update | Implemented with UI limitation | The backend updates the authenticated user's existing review; the order screen does not show an edit button after submission in the same session. |
| Admin can delete a review | Implemented with validation gap | Admins can delete a review from the Reviews tab; the backend recalculates the product rating after deletion, but an unknown review ID is not explicitly rejected. |
| Filter/mask bad words from reviews | Implemented with custom filter | Review names and comments are masked before storage and when returned; the `bad-words` package is not installed or used. |
| Form validation: Product CRUD, User Login, Update Profile | Implemented with Yup | All three flows call shared Yup schemas through `validate`; Formik and React Hook Form are not used in the actual code. |
| Completed transaction | Partially implemented | Cart, shipping, confirmation, COD order creation, stock update, order persistence, and success page exist; online payment is not implemented. |
| Sales charts with date range filter | Implemented with chart-scope limitation | Monthly sales has a start/end date filter and line chart; product and customer sales use bar charts but do not expose date inputs in their frontend components. |
| Product pagination on homepage | Implemented | The products API returns 12 products per page and the homepage sends the current page number. |
| Infinite scroll on homepage product list | Implemented | The homepage requests the next page near the bottom of the window and appends the returned products. |
| Gmail/Google login using Firebase | Implemented | Login uses Firebase `GoogleAuthProvider`, popup authentication, ID-token synchronization, and the existing user session flow. |
| Facebook login using Firebase | Not implemented | No `FacebookAuthProvider`, Facebook login handler, or `react-facebook-login`/similar package was found. |
| Transaction email with PDF receipt | Implemented | Customer emails include the product list, line totals, subtotal, and grand total, with a PDF receipt attached. |
| Service CRUD datatable | Not implemented | There is no Service model, controller, route, admin screen, or service-specific API in the current system. |

## Product locations

### Gmail/Google and Facebook login

- `frontend/src/Components/User/Login.jsx`
  - Imports Firebase `GoogleAuthProvider` and `signInWithPopup`.
  - `googleLogin()` opens the Firebase Google sign-in popup.
  - `finishLogin()` obtains the Firebase ID token, calls `POST /api/v1/users/sync`, stores the authenticated user, and redirects by role.
  - The visible button is `Continue with Google`.
- `frontend/src/firebase.js`
  - Initializes the Firebase app from `VITE_FIREBASE_*` environment values.
  - Exports the Firebase `auth` instance used by the login component.
- `backend/routes/auth.js`
  - Registers `POST /api/v1/users/sync`.
- `backend/middlewares/auth.js`
  - Verifies the Firebase ID token with Firebase Admin before user synchronization and protected API access.
- `backend/controllers/auth.js`
  - `syncUser` synchronizes Firebase identity/profile data into the MongoDB User model.
- `backend/models/user.js`
  - Stores the Firebase UID, email, name, role, and avatar.
- `frontend/package.json`
  - Includes the `firebase` package.

Google/Gmail login flow:

```text
Login.jsx googleLogin()
    -> Firebase signInWithPopup(auth, new GoogleAuthProvider())
    -> credential.user.getIdToken()
    -> POST /api/v1/users/sync with Bearer token
    -> Firebase Admin verifyIdToken()
    -> User synchronization in MongoDB
    -> helpers.authenticate() and Redux loginSuccess()
    -> navigate to / or /dashboard
```

Facebook status: Facebook login is not implemented. No `FacebookAuthProvider`, Facebook handler, `react-facebook-login`, or similar social-login package was found in the actual project dependencies or source files.

### Product pagination on homepage

- `frontend/src/Components/Home.jsx`
  - Stores the current page in `page`.
  - Sends `page: nextPage` through the product query string.
  - Reads `resPerPage` from the API response to determine whether another page exists.
- `frontend/src/actions/productActions.jsx`
  - `getProducts(query, append)` sends the query to `GET /api/v1/products`.
  - Dispatches either `productsSuccess` for a fresh page or `productsAppend` for a later page.
- `frontend/src/reducers/productReducers.jsx`
  - Handles `PRODUCTS_REQUEST`, `PRODUCTS_SUCCESS`, and `PRODUCTS_APPEND`.
  - Appends later products to the existing product array for `PRODUCTS_APPEND`.
- `backend/controllers/product.js`
  - `getProducts` applies `pagination(resPerPage)` with `resPerPage = 12`.
  - Returns `products`, `productsCount`, `resPerPage`, and `filteredProductsCount`.
- `backend/utils/apiFeatures.js`
  - `pagination(resPerPage)` converts the requested page into Mongoose `limit` and `skip` values.

Pagination flow:

```text
Home page state
    -> page query parameter
    -> GET /api/v1/products?page=N
    -> productController.getProducts()
    -> APIFeatures.pagination(12)
    -> MongoDB Product.find().limit(12).skip(...)
    -> products + resPerPage response
    -> productReducers product list
```

### Infinite scroll on homepage product list

- `frontend/src/Components/Home.jsx`
  - Registers a window `scroll` event.
  - Requests `getProducts(page + 1, true)` when the viewport is within 500 pixels of the document bottom.
  - Uses `hasMore`, `loadingMore`, and `loading` to prevent duplicate requests.
  - Shows `Loading more products...` while an append request is active.
  - Shows the end-of-list state when `hasMore` becomes false.
- `frontend/src/actions/productActions.jsx`
  - Uses the `append` flag to dispatch `productsAppend(data)`.
- `frontend/src/reducers/productReducers.jsx`
  - Merges the next page into the existing `products` array.
- `backend/controllers/product.js` and `backend/utils/apiFeatures.js`
  - Serve each requested page through the same filtered/paginated product query.

Infinite-scroll flow:

```text
User scrolls homepage
    -> Home scroll handler
    -> if near bottom and hasMore, request page + 1
    -> GET /api/v1/products?page=N plus active filters
    -> backend returns up to 12 products
    -> PRODUCTS_APPEND reducer action
    -> existing product list + new products render
```

### Sales charts with date range filter

- `frontend/src/Components/Admin/Dashboard.jsx`
  - Renders the admin Overview charts.
- `frontend/src/Components/Admin/DashboardOverview.jsx`
  - Loads total products, users, orders, and sales metrics.
- `frontend/src/Components/Admin/MonthlySalesChart.jsx`
  - Renders a Recharts `LineChart`.
  - Provides `startDate` and `endDate` date inputs.
  - `load()` sends the selected values as query parameters to `GET /api/v1/admin/sales-per-month`.
  - Reloads the chart when either date changes.
- `frontend/src/Components/Admin/ProductSalesChart.jsx`
  - Renders a Recharts `BarChart` using `GET /api/v1/admin/product-sales`.
  - Shows the top 10 product sales returned by the backend.
  - Does not currently render date-range inputs.
- `frontend/src/Components/Admin/UserSalesChart.jsx`
  - Renders a Recharts `BarChart` using `GET /api/v1/admin/customer-sales`.
  - Shows customer sales totals returned by the backend.
  - Does not currently render date-range inputs.
- `backend/routes/order.js`
  - Protects the analytics endpoints with authentication and the admin role.
- `backend/controllers/order.js`
  - `dateMatch(req)` converts `startDate` and `endDate` into a MongoDB `createdAt` range.
  - `salesPerMonth` groups filtered orders by month/year and returns line-chart data.
  - `productSales` groups order items by product name and limits the result to 10.
  - `customerSales` groups orders by user and joins the `users` collection.
- `backend/models/order.js`
  - Provides `createdAt`, `totalPrice`, `orderItems`, and `user` fields used by the aggregations.

Chart flow:

```text
Admin Dashboard
    -> MonthlySalesChart date inputs
    -> GET /api/v1/admin/sales-per-month?startDate=...&endDate=...
    -> orderController.dateMatch()
    -> MongoDB Order.aggregate()
    -> MonthlySalesChart data state
    -> Recharts LineChart
```

Status note: date-range filtering is fully wired for the monthly line chart. The backend aggregation helper supports the same date range for product/customer sales, but those two bar-chart components currently call their endpoints without date query parameters.

### Completed transaction

- `frontend/src/App.jsx`
  - Owns cart and shipping state and persists them to local storage.
  - Provides `addItemToCart`, `removeItemFromCart`, `updateCartQuantity`, and `clearCart` to checkout components.
- `frontend/src/Components/Cart/Cart.jsx`
  - Displays cart products, quantities, line totals, and checkout navigation.
- `frontend/src/Components/Cart/Shipping.jsx`
  - Collects shipping information and navigates to confirmation.
- `frontend/src/Components/Cart/ConfirmOrder.jsx`
  - Displays the order confirmation before payment/order submission.
- `frontend/src/Components/Cart/Payment.jsx`
  - Submits the order through `POST /api/v1/order/new`.
  - Sends COD payment data and clears the cart after success.
- `frontend/src/Components/Cart/OrderSuccess.jsx`
  - Displays the successful order confirmation page.
- `backend/routes/order.js`
  - Registers `POST /api/v1/order/new`.
- `backend/controllers/order.js`
  - `newOrder` verifies products and stock, recalculates prices from the database, creates the order, decrements stock, and triggers the receipt notification.
- `backend/models/order.js`
  - Stores shipping info, order items, payment info, subtotal, tax, shipping, grand total, and status.
- `backend/models/product.js`
  - Provides the authoritative product price and stock used during order creation.

Transaction path:

```text
Product card
    -> App.addItemToCart()
    -> Cart.jsx
    -> Shipping.jsx
    -> ConfirmOrder.jsx
    -> Payment.submit()
    -> POST /api/v1/order/new
    -> orderController.newOrder()
    -> Product.findById() and stock validation
    -> Order.create()
    -> Product.findByIdAndUpdate() stock decrement
    -> OrderSuccess.jsx
```

Status note: the transaction flow is implemented for Cash on Delivery. Stripe, PayPal, card processing, payment intents, webhooks, and payment verification are not implemented.

### Transaction email and PDF receipt

- `backend/controllers/order.js`
  - Builds the customer email after a new order is created.
  - Sends each product name, quantity, and line total in the email body.
  - Includes the subtotal and grand total in the email body.
  - Also attaches the generated PDF receipt.
  - Sends the same receipt email when an admin updates an order status.
- `backend/utils/sendEmail.js`
  - Sends the email through the configured SMTP transport.
  - Supports PDF attachments through Nodemailer.
- `backend/utils/receiptPdf.js`
  - Generates the PDF receipt with products, subtotal, tax, shipping, grand total, customer, order, and payment details.
- `backend/routes/order.js`
  - `POST /api/v1/order/new` triggers the order confirmation email.
  - `PUT /api/v1/admin/order/:id` triggers a status-update email with the receipt.
- `backend/models/order.js`
  - Stores the order products in `orderItems` and totals in `itemsPrice`, `taxPrice`, `shippingPrice`, and `totalPrice`.

### User review/rating update

- `frontend/src/Components/Order/ListOrders.jsx`
  - Shows the review form only for items in delivered orders.
  - Sends the user's product ID, rating, and comment to `PUT /api/v1/review`.
  - Keeps the submitted state in local component state after a successful submission.
- `backend/controllers/product.js`
  - `createOrUpdateReview` requires that the authenticated user purchased and received the product.
  - Finds an existing review by the authenticated user's ID and updates its rating/comment with `Object.assign`.
  - Creates a new review when the user has not reviewed the product yet.
  - Recalculates `numOfReviews` and the product's aggregate `ratings` after either create or update.
- `backend/routes/product.js`
  - `PUT /api/v1/review` is the user review create/update endpoint.
- `backend/models/product.js`
  - Stores the review owner in `reviews.user`, along with `rating` and `comment`.

The current frontend does not expose a direct edit button after submission during the same session. Reloading the orders page allows the user to submit the review again, and the backend updates the existing review instead of creating a duplicate.

### Admin review deletion

- `frontend/src/Components/Admin/Dashboard.jsx`
  - Registers the `Reviews` admin tab.
- `frontend/src/Components/Admin/ProductReviews.jsx`
  - Loads admin reviews from `GET /api/v1/admin/reviews`.
  - Renders the Delete action for each review.
  - `remove(review)` sends `DELETE /api/v1/reviews` with `productId` and review `id`.
  - Removes the deleted review from the local table and shows a success message.
- `backend/routes/product.js`
  - Protects `DELETE /api/v1/reviews` with `isAuthenticatedUser` and `authorizeRoles('admin')`.
- `backend/controllers/product.js`
  - `deleteReview` finds the product, removes the matching embedded review, recalculates `numOfReviews` and aggregate `ratings`, then saves the product.
- `backend/models/product.js`
  - Stores reviews inside the Product document and stores the recalculated `ratings` and `numOfReviews` fields.

Status note: the delete flow is implemented, but `deleteReview` does not explicitly return an error when the supplied review ID does not match an embedded review. This is documented as a validation gap rather than a missing feature.

### Bad-words review masking

- `backend/utils/profanityFilter.js`
  - Defines the actual English and Filipino `blockedWords` list.
  - Builds a Unicode-aware regular expression with word boundaries.
  - Exports `maskProfanity(value)` and replaces matched non-space characters with asterisks.
- `backend/controllers/product.js`
  - Imports `maskProfanity` from `../utils/profanityFilter`.
  - Masks the authenticated user's name and review comment in `createOrUpdateReview` before saving.
  - Masks review names and comments again in `getProductReviews` and `getAdminReviews` before returning them.

Status note: the requested masking behavior is implemented, but the `bad-words` npm package itself is not present in `backend/package.json` and no import of that package was found. The system uses the custom `blockedWords` and `maskProfanity` implementation instead.

### Form validation: Product CRUD, User Login, and Update Profile

- `frontend/src/Utils/validation.js`
  - Imports Yup from `yup`.
  - Defines `productSchema` for product name, slug, brand, SKU, price, stock, and description.
  - Defines `loginSchema` for valid email and minimum six-character password.
  - Defines `profileSchema` for a trimmed name with a minimum length of two characters.
  - Exports the shared async `validate(schema, value)` helper with `abortEarly: false`.
- `frontend/src/Components/Admin/NewProduct.jsx`
  - Calls `validate(productSchema, ...)` before creating a product.
  - Converts price and stock to numbers before validation.
- `frontend/src/Components/Admin/UpdateProduct.jsx`
  - Calls `validate(productSchema, ...)` before updating a product.
  - Converts price and stock to numbers before validation.
- `frontend/src/Components/User/Login.jsx`
  - Calls `validate(loginSchema, { email, password })` before Firebase sign-in.
- `frontend/src/Components/User/Profile.jsx`
  - Calls `validate(profileSchema, { name })` before sending the profile update.
- `frontend/package.json`
  - Includes the `yup` dependency.

Library status: Yup is implemented. No `formik`, `Formik`, `useFormik`, `react-hook-form`, or `useForm` usage was found. The forms use React `useState`, native `onSubmit`, and the shared Yup helper instead.

### Review filter status

The system has review management, but not a review filter yet:

- `frontend/src/Components/Admin/ProductReviews.jsx`
  - Loads all admin reviews from `GET /api/v1/admin/reviews`.
  - Displays product, reviewer, rating, and comment columns.
  - Supports deleting a review, but has no filter controls.
- `frontend/src/Components/Product/ProductDetails.jsx`
  - Loads the selected product and its review data for the product detail view.
- `backend/controllers/product.js`
  - `getAdminReviews` returns the admin review list.
  - `getProductReviews` returns reviews for a product.
  - `deleteReview` deletes a review and recalculates the product rating.
- `backend/routes/product.js`
  - `GET /api/v1/admin/reviews`
  - `GET /api/v1/reviews`
  - `DELETE /api/v1/reviews`
- `backend/models/product.js`
  - Defines the embedded `reviews` array, `ratings`, and `numOfReviews` fields.

### Ratings filter

- `frontend/src/Components/Home.jsx`
  - Renders the `Minimum rating` selector with `Any rating`, `4+ stars`, and `4.5+ stars` options.
  - Sends the selected value as `rating: gte:<value>`.
  - Reloads the product list when the selected rating changes.
- `frontend/src/actions/productActions.jsx`
  - Sends the ratings query string to `GET /api/v1/products`.
- `backend/utils/apiFeatures.js`
  - Converts the `rating: gte:<value>` query into a MongoDB `ratings: { $gte: value }` filter.
- `backend/controllers/product.js`
  - Applies the shared ratings filter in `getProducts`.
- `backend/models/product.js`
  - Stores the aggregate product rating in the `ratings` field, constrained from 0 to 5.

### Category filter

- `frontend/src/Components/Home.jsx`
  - Defines the available product categories.
  - Renders the category filter buttons, including `All categories`.
  - Sends the selected category as the `category` query parameter.
  - Reloads the product list when the selected category changes.
- `frontend/src/actions/productActions.jsx`
  - Sends the category query string to `GET /api/v1/products`.
- `backend/utils/apiFeatures.js`
  - Converts the category query parameter into a MongoDB field filter.
- `backend/controllers/product.js`
  - Applies the shared category filter in `getProducts`.
- `backend/models/product.js`
  - Defines the allowed category values through the product schema enum.

### Price filter

- `frontend/src/Components/Home.jsx`
  - Renders the maximum-price range slider from PHP 0 to PHP 160,000.
  - Sends the selected value as the `price[lte]` query parameter.
  - Reloads the product list when the selected maximum changes.
- `frontend/src/Components/HomeFilters.css`
  - Styles the price filter and range labels.
- `frontend/src/actions/productActions.jsx`
  - Sends the filter query string to `GET /api/v1/products`.
- `backend/utils/apiFeatures.js`
  - Translates `price[lte]` into a MongoDB `$lte` filter.
- `backend/controllers/product.js`
  - Applies the shared search/filter pipeline in `getProducts`.

### Frontend

- `frontend/src/Components/Admin/ProductsList.jsx`
  - Product datatable/table rendering
  - Search by name, brand, SKU, and category
  - Sorting by name, price, or stock
  - Row checkboxes and select-all-visible checkbox
  - Single delete and bulk delete actions
- `frontend/src/Components/Admin/NewProduct.jsx`
  - Product creation form
  - Multiple image input using `multiple`
  - Image preview before upload
- `frontend/src/Components/Admin/UpdateProduct.jsx`
  - Product edit form
  - Multiple additional image upload
  - Existing image removal
- `frontend/src/Components/Admin/Dashboard.jsx`
  - Registers the Products admin tab and switches between list, create, and update views
- `frontend/src/Components/Admin/Admin.css`
  - Admin table, toolbar, action, and form styling
- `frontend/src/Components/Admin/AdminImages.css`
  - Product thumbnail and image-manager styling

### Backend

- `backend/models/product.js`
  - Product data model, including the `images` array with `public_id` and `url`
- `backend/controllers/product.js`
  - `newProduct`: uploads all received files and creates the product
  - `updateProduct`: uploads additional files and appends them to existing images
  - `deleteProduct`: deletes one product and its Cloudinary images
  - `bulkDeleteProducts`: deletes selected products and their Cloudinary images
  - `deleteProductImage`: removes one image from an existing product
  - `getAdminProducts`: returns products for the admin table
- `backend/routes/product.js`
  - `POST /api/v1/admin/product/new`
  - `GET /api/v1/admin/products`
  - `PUT /api/v1/admin/product/:id`
  - `DELETE /api/v1/admin/product/:id`
  - `DELETE /api/v1/admin/products/bulk`
  - `DELETE /api/v1/admin/product/:id/image/:imageId`
- `backend/utils/multer.js`
  - Accepts JPEG, PNG, and WebP files
  - Limits each file to 5 MB
- `backend/utils/cloudinary.js`
  - Provides image upload and deletion used by product CRUD

All product admin routes require authentication and the `admin` role.

## Bulk delete behavior

1. The table stores selected product IDs in `ProductsList.jsx`.
2. The select-all checkbox applies to the currently visible, filtered products.
3. The frontend sends `{ ids: [...] }` to `DELETE /api/v1/admin/products/bulk`.
4. The backend removes the matching MongoDB documents and deletes their Cloudinary images.

## Service CRUD gap

The current application is a UPS product store and has no separate service domain. A complete Service implementation would require at least:

- `backend/models/service.js`
- Service controller and admin routes
- Service admin list/create/update screens
- Service tab or navigation entry in `frontend/src/Components/Admin/Dashboard.jsx`
- Service API calls and validation

No Service files were added because no service fields or workflow are defined in the current requirements. The Product implementation above is already available for the requested catalog workflow.