const initialState = {
  user: null,
  loading: false,
  isAuthenticated: false,
  error: null,
};

export const userInitialState = initialState;

const userReducers = (state = initialState, action = {}) => {
  switch (action.type) {
    case "USER_REQUEST":
    case "LOGIN_REQUEST":
    case "REGISTER_REQUEST":
      return { ...state, loading: true, error: null };
    case "USER_SUCCESS":
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload,
        isAuthenticated: true,
        error: null,
      };
    case "USER_FAIL":
    case "LOGIN_FAIL":
    case "REGISTER_FAIL":
      return {
        ...state,
        loading: false,
        user: null,
        isAuthenticated: false,
        error: action.payload,
      };
    case "LOGOUT_SUCCESS":
      return { ...initialState };
    case "UPDATE_PROFILE_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload,
        isAuthenticated: true,
        error: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

export default userReducers;
