import { useEffect, useState } from "react";
import axios from "axios";
import { errMsg, getToken } from "../../Utils/helpers.jsx";

const api = import.meta.env.VITE_API_URL;
const config = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    orders: 0,
    sales: 0,
    lowStock: [],
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      try {
        const [productsResponse, usersResponse, ordersResponse, salesResponse] =
          await Promise.allSettled([
            axios.get(`${api}/admin/products`, config()),
            axios.get(`${api}/admin/users`, config()),
            axios.get(`${api}/admin/total-orders`, config()),
            axios.get(`${api}/admin/total-sales`, config()),
          ]);
        const products =
          productsResponse.status === "fulfilled"
            ? productsResponse.value.data.products || []
            : [];
        const users =
          usersResponse.status === "fulfilled"
            ? usersResponse.value.data.users || []
            : [];
        const orders =
          ordersResponse.status === "fulfilled"
            ? ordersResponse.value.data.total || 0
            : 0;
        const sales =
          salesResponse.status === "fulfilled"
            ? salesResponse.value.data.total || 0
            : 0;
        if (
          [productsResponse, usersResponse, ordersResponse, salesResponse].some(
            (result) => result.status === "rejected",
          )
        )
          errMsg({
            response: {
              data: { message: "Some dashboard metrics could not be loaded" },
            },
          });
        setStats({
          products: products.length,
          users: users.length,
          orders,
          sales,
          lowStock: products.filter((product) => product.stock < 5).slice(0, 6),
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  if (loading)
    return (
      <section className="admin-stat-grid">
        <div className="admin-panel">
          <p className="muted">Loading dashboard...</p>
        </div>
      </section>
    );
  return (
    <>
      <section className="admin-stat-grid">
        <div className="admin-stat">
          <span className="muted">Catalog products</span>
          <strong>{stats.products}</strong>
        </div>
        <div className="admin-stat">
          <span className="muted">Registered users</span>
          <strong>{stats.users}</strong>
        </div>
        <div className="admin-stat">
          <span className="muted">Total orders</span>
          <strong>{stats.orders}</strong>
        </div>
        <div className="admin-stat">
          <span className="muted">Total sales</span>
          <strong>PHP {stats.sales.toLocaleString()}</strong>
        </div>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <div className="eyebrow">Inventory watch</div>
            <h2>Low-stock products</h2>
          </div>
          <span className="muted">Below 5 units</span>
        </div>
        {stats.lowStock.length ? (
          stats.lowStock.map((product) => (
            <div
              key={product._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                padding: "13px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <strong>{product.name}</strong>
              <span className="low-stock">{product.stock} remaining</span>
            </div>
          ))
        ) : (
          <p className="admin-empty">Inventory levels are healthy.</p>
        )}
      </section>
    </>
  );
};
export default DashboardOverview;
