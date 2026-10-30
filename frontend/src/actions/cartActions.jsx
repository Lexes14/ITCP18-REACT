export const addToCart = (product, quantity = 1) => ({
  type: "CART_ADD_ITEM",
  payload: {
    product: product._id,
    name: product.name,
    price: product.salePrice || product.price,
    image: product.images?.[0]?.url,
    quantity,
  },
});

export const removeFromCart = (id) => ({
  type: "CART_REMOVE_ITEM",
  payload: id,
});
export const updateCartQuantity = (id, quantity) => ({
  type: "CART_UPDATE_QUANTITY",
  payload: { id, quantity },
});
export const clearCart = () => ({ type: "CART_CLEAR_ITEMS" });
export const saveShippingInfo = (shippingInfo) => ({
  type: "SAVE_SHIPPING_INFO",
  payload: shippingInfo,
});
export const clearShippingInfo = () => ({ type: "CLEAR_SHIPPING_INFO" });
