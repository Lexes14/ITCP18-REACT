import { useNavigate } from "react-router-dom";
const ConfirmOrder = ({ cartItems, shippingInfo }) => {
  const navigate = useNavigate();
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return (
    <main className="container">
      <section
        className="filter-panel"
        style={{ maxWidth: 700, margin: "0 auto" }}
      >
        <div className="eyebrow">Checkout / 02</div>
        <h1>Confirm order</h1>
        <p>
          <strong>Deliver to:</strong> {shippingInfo.address},{" "}
          {shippingInfo.city}, {shippingInfo.country}
        </p>
        {cartItems.map((item) => (
          <div key={item.product} className="price-row">
            <span>
              {item.name} x {item.quantity}
            </span>
            <strong>
              PHP{" "}
              {Number(item.price * item.quantity).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </div>
        ))}
        <div className="price-row" style={{ marginTop: 20 }}>
          <strong>Total</strong>
          <strong>
            PHP{" "}
            {Number(total).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
            })}
          </strong>
        </div>
        <button
          className="add"
          style={{ marginTop: 20 }}
          onClick={() => navigate("/checkout/payment")}
        >
          Continue to payment
        </button>
      </section>
    </main>
  );
};
export default ConfirmOrder;
