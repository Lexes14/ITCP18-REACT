import axios from "axios";

const api = import.meta.env.VITE_API_URL;
export const productsRequest = () => ({ type: "PRODUCTS_REQUEST" });
export const productsSuccess = (payload) => ({
  type: "PRODUCTS_SUCCESS",
  payload,
});
export const productsAppend = (payload) => ({
  type: "PRODUCTS_APPEND",
  payload,
});
export const productsFail = (message) => ({
  type: "PRODUCTS_FAIL",
  payload: message,
});

export const getProducts =
  (query = "", append = false, requestConfig = {}) =>
  async (dispatch) => {
    dispatch(productsRequest());
    try {
      const { data } = await axios.get(
        `${api}/products${query ? `?${query}` : ""}`,
        requestConfig,
      );
      dispatch(append ? productsAppend(data) : productsSuccess(data));
      return data;
    } catch (error) {
      dispatch(
        productsFail(
          error?.response?.data?.message ||
            error.message ||
            "Unable to load products",
        ),
      );
      throw error;
    }
  };
