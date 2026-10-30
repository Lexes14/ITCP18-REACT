import { useState } from "react";
import { Navigate } from "react-router-dom";
import ProductsList from "./ProductsList.jsx";
import NewProduct from "./NewProduct.jsx";
import UpdateProduct from "./UpdateProduct.jsx";
import UsersList from "./UsersList.jsx";
import OrdersList from "./OrdersList.jsx";
import ProductReviews from "./ProductReviews.jsx";
import DashboardOverview from "./DashboardOverview.jsx";
import MonthlySalesChart from "./MonthlySalesChart.jsx";
import ProductSalesChart from "./ProductSalesChart.jsx";
import UserSalesChart from "./UserSalesChart.jsx";
import { getUser } from "../../Utils/helpers.jsx";
import "./Admin.css";
import "./AdminImages.css";

const Dashboard = () => {
  const user = getUser();
  const [tab, setTab] = useState("overview");
  const [editor, setEditor] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  const refresh = () => {
    setEditor(null);
    setRefreshKey((current) => current + 1);
  };
  return (
    <main className="container admin-shell">
      <header className="admin-header">
        <div>
          <div className="eyebrow">Operations / Admin</div>
          <h1>Control room</h1>
        </div>
        <p>
          Manage the catalog, customer access, orders, and customer feedback
          from one workspace.
        </p>
      </header>
      <DashboardOverview />
      {tab === "overview" && (
        <div className="chart-grid">
          <MonthlySalesChart />
          <ProductSalesChart />
          <UserSalesChart />
        </div>
      )}
      <nav className="admin-tabs" aria-label="Admin sections">
        <button
          className={tab === "overview" ? "active" : ""}
          onClick={() => {
            setTab("overview");
            setEditor(null);
          }}
        >
          Overview
        </button>
        {[
          ["products", "Products"],
          ["users", "Users"],
          ["orders", "Orders"],
          ["reviews", "Reviews"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={tab === value ? "active" : ""}
            onClick={() => {
              setTab(value);
              setEditor(null);
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "overview" && (
        <p className="muted">
          Use the sections above to manage each part of the store.
        </p>
      )}
      {tab === "products" &&
        (editor === "new" ? (
          <NewProduct onSaved={refresh} onCancel={() => setEditor(null)} />
        ) : editor ? (
          <UpdateProduct
            product={editor}
            onSaved={refresh}
            onCancel={() => setEditor(null)}
          />
        ) : (
          <ProductsList
            refreshKey={refreshKey}
            onCreate={() => setEditor("new")}
            onEdit={setEditor}
          />
        ))}
      {tab === "users" && <UsersList />}
      {tab === "orders" && <OrdersList />}
      {tab === "reviews" && <ProductReviews />}
    </main>
  );
};
export default Dashboard;
