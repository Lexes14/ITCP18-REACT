import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import Home from "./Components/Home.jsx";
import ProductDetails from "./Components/Product/ProductDetails.jsx";
import Cart from "./Components/Cart/Cart.jsx";
import Shipping from "./Components/Cart/Shipping.jsx";
import ConfirmOrder from "./Components/Cart/ConfirmOrder.jsx";
import Payment from "./Components/Cart/Payment.jsx";
import OrderSuccess from "./Components/Cart/OrderSuccess.jsx";
import ListOrders from "./Components/Order/ListOrders.jsx";
import OrderDetails from "./Components/Order/OrderDetails.jsx";
import Login from "./Components/User/Login.jsx";
import Register from "./Components/User/Register.jsx";
import ForgotPassword from "./Components/User/ForgotPassword.jsx";
import Profile from "./Components/User/Profile.jsx";
import UpdatePassword from "./Components/User/UpdatePassword.jsx";
import NewPassword from "./Components/User/NewPassword.jsx";
import { getUser, logout, successMsg } from "./Utils/helpers.jsx";
import { logoutSuccess } from "./actions/userActions.jsx";
import Loader from "./Components/Layout/Loader.jsx";
import {
  addToCart,
  clearCart as clearCartAction,
  clearShippingInfo,
  removeFromCart,
  saveShippingInfo,
  updateCartQuantity as updateCartQuantityAction,
} from "./actions/cartActions.jsx";

const Dashboard = lazy(() => import("./Components/Admin/Dashboard.jsx"));

const App = () => {
  const { cartItems, shippingInfo } = useSelector((state) => state.cart);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true",
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);
  useEffect(() => {
    localStorage.setItem("shippingInfo", JSON.stringify(shippingInfo));
  }, [shippingInfo]);
  useEffect(() => {
    document.documentElement.style.filter = darkMode
      ? "invert(.9) hue-rotate(180deg)"
      : "";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);
  const addItemToCart = (product, quantity = 1) => {
    dispatch(addToCart(product, quantity));
    successMsg("Added to your power stack");
  };
  const removeItemFromCart = (id) => dispatch(removeFromCart(id));
  const updateCartQuantity = (id, quantity) =>
    dispatch(updateCartQuantityAction(id, quantity));
  const clearCart = () => dispatch(clearCartAction());
  const setShippingInfo = (info) => dispatch(saveShippingInfo(info));
  const signOut = async () => {
    await logout();
    dispatch(logoutSuccess());
    dispatch(clearCartAction());
    dispatch(clearShippingInfo());
    localStorage.removeItem("cartItems");
    localStorage.removeItem("shippingInfo");
    navigate("/");
    successMsg("Signed out");
  };
  const user = getUser();
  return (
    <div className="app">
      <header className="topbar">
        <nav className="nav">
          <a className="brand" href="/">
            UPS <span>BATTERY</span> STORE
          </a>
          <div className="search">
            <select defaultValue="all">
              <option value="all">All systems</option>
              <option>UPS</option>
              <option>Batteries</option>
              <option>Inverters</option>
            </select>
            <input
              placeholder="Search capacity, model, SKU..."
              onKeyDown={(event) =>
                event.key === "Enter" &&
                navigate(`/search/${event.currentTarget.value}`)
              }
            />
            <button aria-label="Search">Search</button>
          </div>
          <div className="nav-actions">
            <button
              className="icon-button"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
            >
              Mode
            </button>
            {user ? (
              <>
                {user.role === "admin" && (
                  <button
                    className="icon-button admin-nav-button"
                    onClick={() => navigate("/dashboard")}
                    aria-label="Open admin dashboard"
                  >
                    Dashboard
                  </button>
                )}
                <button
                  className="icon-button"
                  onClick={() => navigate("/profile")}
                  aria-label="View profile"
                >
                  Profile
                </button>
                <button
                  className="icon-button"
                  onClick={() => navigate("/orders")}
                  aria-label="View my orders"
                >
                  Orders
                </button>
                <button
                  className="icon-button"
                  onClick={signOut}
                  aria-label="Sign out"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                className="icon-button"
                onClick={() => navigate("/login")}
                aria-label="Sign in"
              >
                Sign in
              </button>
            )}
            <button
              className="icon-button"
              onClick={() => navigate("/cart")}
              aria-label="Cart"
            >
              Cart{" "}
              <b className="count">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </b>
            </button>
          </div>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home addItemToCart={addItemToCart} />} />
        <Route
          path="/search/:keyword"
          element={<Home addItemToCart={addItemToCart} />}
        />
        <Route
          path="/product/:id"
          element={<ProductDetails addItemToCart={addItemToCart} />}
        />
        <Route
          path="/cart"
          element={
            <Cart
              cartItems={cartItems}
              removeItemFromCart={removeItemFromCart}
              updateCartQuantity={updateCartQuantity}
            />
          }
        />
        <Route
          path="/checkout/shipping"
          element={
            <Shipping
              shippingInfo={shippingInfo}
              setShippingInfo={setShippingInfo}
            />
          }
        />
        <Route
          path="/checkout/confirm"
          element={
            <ConfirmOrder cartItems={cartItems} shippingInfo={shippingInfo} />
          }
        />
        <Route
          path="/checkout/payment"
          element={
            <Payment
              cartItems={cartItems}
              shippingInfo={shippingInfo}
              clearCart={clearCart}
            />
          }
        />
        <Route path="/order/success/:id" element={<OrderSuccess />} />
        <Route path="/orders" element={<ListOrders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset" element={<NewPassword />} />
        <Route path="/password/update" element={<UpdatePassword />} />
        <Route
          path="/dashboard"
          element={
            <Suspense
              fallback={
                <main className="container">
                  <Loader label="Loading dashboard..." fullPage />
                </main>
              }
            >
              <Dashboard />
            </Suspense>
          }
        />
        <Route path="*" element={<Home addItemToCart={addItemToCart} />} />
      </Routes>
      <footer className="footer">
        <div className="footer-inner">
          <strong>UPS Battery Store</strong>
          <span>Power continuity, 2026</span>
        </div>
      </footer>
    </div>
  );
};
export default App;
