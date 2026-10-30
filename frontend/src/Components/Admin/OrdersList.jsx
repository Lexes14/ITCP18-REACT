import { useEffect, useState } from "react";
import axios from "axios";
import { errMsg, getToken, successMsg } from "../../Utils/helpers.jsx";

const api = import.meta.env.VITE_API_URL;
const config = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });
const statuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
const nextStatuses = {
  Processing: ["Processing", "Shipped", "Cancelled"],
  Shipped: ["Shipped", "Delivered"],
  Delivered: ["Delivered"],
  Cancelled: ["Cancelled"],
};

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const load = async () => {
    try {
      const { data } = await axios.get(`${api}/admin/orders`, config());
      setOrders(data.orders || []);
    } catch (error) {
      errMsg(error);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.put(
        `${api}/admin/order/${id}`,
        { status },
        config(),
      );
      setOrders((current) =>
        current.map((order) => (order._id === id ? data.order : order)),
      );
      successMsg("Order updated");
    } catch (error) {
      errMsg(error);
      load();
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await axios.delete(`${api}/admin/order/${id}`, config());
      setOrders((current) => current.filter((order) => order._id !== id));
      successMsg("Order deleted");
    } catch (error) {
      errMsg(error);
    }
  };
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <div className="eyebrow">Fulfillment</div>
          <h2>Orders</h2>
        </div>
        <span className="muted">{orders.length} orders</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>
                  <strong>#{order._id.slice(-8)}</strong>
                  <small>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </small>
                </td>
                <td>{order.user?.email || "Unknown user"}</td>
                <td>
                  PHP{" "}
                  {Number(order.totalPrice || 0).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td>
                  <select
                    value={order.orderStatus}
                    onChange={(event) =>
                      updateStatus(order._id, event.target.value)
                    }
                    disabled={
                      order.orderStatus === "Delivered" ||
                      order.orderStatus === "Cancelled"
                    }
                  >
                    {(nextStatuses[order.orderStatus] || statuses).map(
                      (status) => (
                        <option key={status}>{status}</option>
                      ),
                    )}
                  </select>
                </td>
                <td>
                  <button
                    className="table-button danger"
                    onClick={() => remove(order._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && <p className="admin-empty">No orders found.</p>}
      </div>
    </section>
  );
};
export default OrdersList;
