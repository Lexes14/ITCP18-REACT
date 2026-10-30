import { Link, useNavigate } from "react-router-dom";
const peso = (value) =>
  `PHP ${Number(value).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const Cart = ({ cartItems, removeItemFromCart, updateCartQuantity }) => {
  const navigate = useNavigate();
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return (
    <main className="container">
      <div className="eyebrow">Order staging</div>
      <h1>Power stack</h1>
      {cartItems.length === 0 ? (
        <p className="muted">
          Your cart is clear. <Link to="/">Browse systems</Link>
        </p>
      ) : (
        <section className="filter-panel">
          {cartItems.map((item) => (
            <div
              key={item.product}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 18,
                padding: "15px 0",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div style={{ flex: 1 }}>
                <strong>{item.name}</strong>
                <div className="muted">{peso(item.price)} each</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  className="table-button"
                  aria-label={`Decrease ${item.name} quantity`}
                  onClick={() =>
                    updateCartQuantity(item.product, item.quantity - 1)
                  }
                >
                  -
                </button>
                <input
                  aria-label={`${item.name} quantity`}
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) =>
                    updateCartQuantity(item.product, event.target.value)
                  }
                  style={{
                    width: 58,
                    textAlign: "center",
                    padding: 8,
                    border: "1px solid #e2e8f0",
                    borderRadius: 4,
                  }}
                />
                <button
                  type="button"
                  className="table-button"
                  aria-label={`Increase ${item.name} quantity`}
                  onClick={() =>
                    updateCartQuantity(item.product, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="price">
                  {peso(item.price * item.quantity)}
                </span>
                <button
                  className="category"
                  onClick={() => removeItemFromCart(item.product)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="price-row" style={{ marginTop: 22 }}>
            <strong>Total</strong>
            <span className="price">{peso(total)}</span>
          </div>
          <button
            className="add"
            style={{ marginTop: 20 }}
            onClick={() => navigate("/checkout/shipping")}
          >
            Proceed to checkout
          </button>
        </section>
      )}
    </main>
  );
};
export default Cart;
