import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { errMsg, getToken, getUser, successMsg } from "../../Utils/helpers.jsx";

const peso = (value) =>
  `PHP ${Number(value).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const ListOrders = () => {
  const [orders, setOrders] = useState([]);
  const [review, setReview] = useState({});
  const user = getUser();
  const load = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders/me`,
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      setOrders(data.orders || []);
    } catch (error) {
      errMsg(error);
    }
  };
  useEffect(() => {
    if (user) load();
  }, [user]);
  const change = (productId, field, value) =>
    setReview((current) => ({
      ...current,
      [productId]: { ...current[productId], [field]: value },
    }));
  const submitReview = async (productId) => {
    try {
      const values = review[productId] || {};
      await axios.put(
        `${import.meta.env.VITE_API_URL}/review`,
        {
          productId,
          rating: Number(values.rating || 5),
          comment: values.comment || "",
        },
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      successMsg("Review submitted");
      setReview((current) => ({
        ...current,
        [productId]: { ...current[productId], submitted: true },
      }));
    } catch (error) {
      errMsg(error);
    }
  };
  if (!user) return <Navigate to="/login" replace />;
  return (
    <main className="container">
      <div className="eyebrow">Account / Orders</div>
      <h1>My orders</h1>
      {!orders.length ? (
        <p className="muted">You have no orders yet.</p>
      ) : (
        orders.map((order) => (
          <section
            className="filter-panel"
            key={order._id}
            style={{ marginBottom: 18 }}
          >
            <div className="price-row">
              <div>
                <strong>Order #{order._id.slice(-8)}</strong>
                <small>
                  <Link to={`/orders/${order._id}`}>View details</Link>
                </small>
              </div>
              <span className="muted">
                {order.orderStatus} · {peso(order.totalPrice)}
              </span>
            </div>
            {order.orderItems.map((item) => {
              const productId = item.product?._id || item.product;
              const values = review[productId] || {};
              return (
                <div
                  key={`${order._id}-${productId}`}
                  style={{ borderTop: "1px solid #e2e8f0", padding: "15px 0" }}
                >
                  <strong>{item.name}</strong>
                  <div className="muted">
                    Qty {item.quantity} · {peso(item.price)}
                  </div>
                  {order.orderStatus === "Delivered" && !values.submitted ? (
                    <div style={{ marginTop: 12 }}>
                      <label>
                        Rating
                        <select
                          value={values.rating || 5}
                          onChange={(event) =>
                            change(productId, "rating", event.target.value)
                          }
                        >
                          <option value="5">5 - Excellent</option>
                          <option value="4">4 - Good</option>
                          <option value="3">3 - Average</option>
                          <option value="2">2 - Poor</option>
                          <option value="1">1 - Bad</option>
                        </select>
                      </label>
                      <label>
                        Review
                        <textarea
                          rows="2"
                          value={values.comment || ""}
                          onChange={(event) =>
                            change(productId, "comment", event.target.value)
                          }
                          required
                        />
                      </label>
                      <button
                        className="add"
                        onClick={() => submitReview(productId)}
                      >
                        Submit review
                      </button>
                    </div>
                  ) : order.orderStatus !== "Delivered" ? (
                    <p className="muted">
                      Review available after the order is delivered.
                    </p>
                  ) : (
                    <p className="muted">Review submitted.</p>
                  )}
                </div>
              );
            })}
          </section>
        ))
      )}
    </main>
  );
};
export default ListOrders;
