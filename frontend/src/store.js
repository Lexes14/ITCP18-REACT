import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { thunk } from "redux-thunk";
import userReducers from "./reducers/userReducers.jsx";
import productReducers from "./reducers/productReducers.jsx";
import cartReducers from "./reducers/cartReducers.jsx";
import orderReducers from "./reducers/orderReducers.jsx";

const rootReducer = combineReducers({
  user: userReducers,
  products: productReducers,
  cart: cartReducers,
  order: orderReducers,
});
const composeEnhancers =
  typeof globalThis !== "undefined" &&
  globalThis.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? globalThis.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk)),
);
export default store;
