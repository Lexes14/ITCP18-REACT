import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { errMsg, successMsg } from "../../Utils/helpers.jsx";
import { createOrder } from "../../actions/orderActions.jsx";
const Payment = ({ cartItems, shippingInfo, clearCart }) => {
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const itemsPrice = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const order = await dispatch(
        createOrder({
          shippingInfo,
          orderItems: cartItems,
          paymentInfo: { status: "COD", id: "COD" },
          itemsPrice,
          taxPrice: 0,
          shippingPrice: 0,
          totalPrice: itemsPrice,
        }),
      );
      clearCart();
      successMsg("Order placed successfully");
      navigate(`/order/success/${order._id}`);
    } catch (error) {
      errMsg(error);
    } finally {
      setSaving(false);
    }
  };
  return (
    <main className="container">
      <form
        className="filter-panel"
        onSubmit={submit}
        style={{ maxWidth: 650, margin: "0 auto" }}
      >
        <div className="eyebrow">Checkout / 03</div>
        <h1>Payment</h1>
        <div className="checkout-choice">
          <strong>Cash on delivery</strong>
          <span className="muted">Pay when your order arrives.</span>
        </div>
        <button className="add" disabled={saving}>
          {saving ? "Placing order..." : "Place COD order"}
        </button>
      </form>
    </main>
  );
};
export default Payment;
