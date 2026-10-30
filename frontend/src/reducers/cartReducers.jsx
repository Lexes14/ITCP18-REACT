const getStored = (key, fallback) => {
  if (typeof globalThis === "undefined" || !globalThis.localStorage)
    return fallback;
  try {
    return JSON.parse(
      globalThis.localStorage.getItem(key) || JSON.stringify(fallback),
    );
  } catch {
    return fallback;
  }
};

const initialState = {
  cartItems: getStored("cartItems", []),
  shippingInfo: getStored("shippingInfo", {}),
};

export const cartInitialState = initialState;

const cartReducers = (state = initialState, action = {}) => {
  switch (action.type) {
    case "CART_ADD_ITEM": {
      const item = action.payload;
      const existing = state.cartItems.find(
        (cartItem) => cartItem.product === item.product,
      );
      const cartItems = existing
        ? state.cartItems.map((cartItem) =>
            cartItem.product === item.product
              ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
              : cartItem,
          )
        : [...state.cartItems, item];
      return { ...state, cartItems };
    }
    case "CART_REMOVE_ITEM":
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) => item.product !== action.payload,
        ),
      };
    case "CART_UPDATE_QUANTITY":
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.product === action.payload.id
            ? {
                ...item,
                quantity: Math.max(1, Number(action.payload.quantity) || 1),
              }
            : item,
        ),
      };
    case "CART_CLEAR_ITEMS":
      return { ...state, cartItems: [] };
    case "SAVE_SHIPPING_INFO":
      return { ...state, shippingInfo: action.payload };
    case "CLEAR_SHIPPING_INFO":
      return { ...state, shippingInfo: {} };
    default:
      return state;
  }
};

export default cartReducers;
