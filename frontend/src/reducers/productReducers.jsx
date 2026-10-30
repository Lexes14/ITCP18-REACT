const initialState = {
  products: [],
  product: null,
  productsCount: 0,
  filteredProductsCount: 0,
  loading: false,
  error: null,
};

export const productInitialState = initialState;

const productReducers = (state = initialState, action = {}) => {
  switch (action.type) {
    case "PRODUCTS_REQUEST":
    case "PRODUCT_REQUEST":
    case "CREATE_PRODUCT_REQUEST":
    case "UPDATE_PRODUCT_REQUEST":
    case "DELETE_PRODUCT_REQUEST":
      return { ...state, loading: true, error: null };
    case "PRODUCTS_SUCCESS":
      return {
        ...state,
        loading: false,
        products: action.payload.products || [],
        productsCount: action.payload.productsCount || 0,
        filteredProductsCount: action.payload.filteredProductsCount || 0,
        error: null,
      };
    case "PRODUCT_SUCCESS":
    case "CREATE_PRODUCT_SUCCESS":
    case "UPDATE_PRODUCT_SUCCESS":
      return { ...state, loading: false, product: action.payload, error: null };
    case "DELETE_PRODUCT_SUCCESS":
      return {
        ...state,
        loading: false,
        products: state.products.filter(
          (product) => product._id !== action.payload,
        ),
        error: null,
      };
    case "PRODUCTS_APPEND":
      return {
        ...state,
        loading: false,
        products: [...state.products, ...(action.payload.products || [])],
        error: null,
      };
    case "PRODUCT_FAIL":
    case "PRODUCTS_FAIL":
    case "CREATE_PRODUCT_FAIL":
    case "UPDATE_PRODUCT_FAIL":
    case "DELETE_PRODUCT_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

export default productReducers;
