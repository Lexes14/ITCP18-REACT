import { Link, useParams } from "react-router-dom";
const OrderSuccess = () => {
  const { id } = useParams();
  return (
    <main className="container">
      <section
        className="filter-panel"
        style={{ maxWidth: 650, margin: "0 auto" }}
      >
        <div className="eyebrow">Order confirmed</div>
        <h1>Order received</h1>
        <p className="muted">
          Your order #{id?.slice(-8)} has been placed. You can track it from
          your orders page.
        </p>
        <Link className="add" to="/orders">
          View my orders
        </Link>
      </section>
    </main>
  );
};
export default OrderSuccess;
