export const loginSuccess = (user) => ({
  type: "LOGIN_SUCCESS",
  payload: user,
});
export const registerSuccess = (user) => ({
  type: "REGISTER_SUCCESS",
  payload: user,
});
export const updateProfileSuccess = (user) => ({
  type: "UPDATE_PROFILE_SUCCESS",
  payload: user,
});
export const logoutSuccess = () => ({ type: "LOGOUT_SUCCESS" });
export const userRequest = () => ({ type: "USER_REQUEST" });
export const userFail = (message) => ({ type: "USER_FAIL", payload: message });
