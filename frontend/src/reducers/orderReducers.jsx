const initialState = {
  order: null,
  loading: false,
  success: false,
  error: null,
};

export const orderInitialState = initialState;

const orderReducers = (state = initialState, action = {}) => {
  switch (action.type) {
    case "ORDER_CREATE_REQUEST":
      return { ...state, loading: true, success: false, error: null };
    case "ORDER_CREATE_SUCCESS":
      return {
        ...state,
        loading: false,
        success: true,
        order: action.payload,
        error: null,
      };
    case "ORDER_CREATE_FAIL":
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };
    case "ORDER_CREATE_RESET":
      return { ...state, success: false };
    case "CLEAR_ORDER_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

export default orderReducers;
