import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import { errMsg, getToken } from "../../Utils/helpers.jsx";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/order/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      .then(({ data }) => setOrder(data.order))
      .catch(errMsg);
  }, [id]);
  if (!getToken()) return <Navigate to="/login" replace />;
  if (!order)
    return (
      <main className="container">
        <div className="skeleton" />
      </main>
    );
  return (
    <main className="container">
      <div className="eyebrow">Account / Order</div>
      <h1>Order #{order._id.slice(-8)}</h1>
      <p className="muted">
        Status: {order.orderStatus} · Placed{" "}
        {new Date(order.createdAt).toLocaleString()}
      </p>
      <section className="filter-panel">
        {order.orderItems.map((item) => (
          <div className="price-row" key={`${order._id}-${item.product}`}>
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
        <div className="price-row" style={{ marginTop: 18 }}>
          <strong>Grand total</strong>
          <strong>
            PHP{" "}
            {Number(order.totalPrice).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
            })}
          </strong>
        </div>
        <p className="muted">
          Deliver to: {order.shippingInfo?.address}, {order.shippingInfo?.city},{" "}
          {order.shippingInfo?.country}
        </p>
        <Link className="add" to="/orders">
          Back to my orders
        </Link>
      </section>
    </main>
  );
};
export default OrderDetails;
