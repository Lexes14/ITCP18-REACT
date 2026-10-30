import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { errMsg, getToken, successMsg } from "../../Utils/helpers.jsx";

const api = import.meta.env.VITE_API_URL;
const authConfig = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});
const ProductsList = ({ onCreate, onEdit, refreshKey = 0 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("name");
  const [selected, setSelected] = useState([]);
  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${api}/admin/products`, authConfig());
      setProducts(data.products || []);
      setSelected([]);
    } catch (error) {
      errMsg(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadProducts();
  }, [refreshKey]);
  const visibleProducts = useMemo(
    () =>
      products
        .filter((product) =>
          `${product.name} ${product.brand} ${product.sku} ${product.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort((left, right) => {
          if (sort === "price")
            return (
              (left.salePrice || left.price) - (right.salePrice || right.price)
            );
          if (sort === "stock") return left.stock - right.stock;
          return left.name.localeCompare(right.name);
        }),
    [products, query, sort],
  );
  const toggle = (id) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  const toggleAll = () =>
    setSelected(
      selected.length === visibleProducts.length
        ? []
        : visibleProducts.map((product) => product._id),
    );
  const removeProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${api}/admin/product/${id}`, authConfig());
      setProducts((current) => current.filter((product) => product._id !== id));
      successMsg("Product deleted");
    } catch (error) {
      errMsg(error);
    }
  };
  const bulkDelete = async () => {
    if (
      !selected.length ||
      !window.confirm(`Delete ${selected.length} selected product(s)?`)
    )
      return;
    try {
      await axios.delete(`${api}/admin/products/bulk`, {
        ...authConfig(),
        data: { ids: selected },
      });
      setProducts((current) =>
        current.filter((product) => !selected.includes(product._id)),
      );
      setSelected([]);
      successMsg("Products deleted");
    } catch (error) {
      errMsg(error);
    }
  };
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <div className="eyebrow">Catalog</div>
          <h2>Products</h2>
        </div>
        <div className="admin-actions">
          <button
            className="admin-button secondary"
            disabled={!selected.length}
            onClick={bulkDelete}
          >
            Delete selected ({selected.length})
          </button>
          <button className="admin-button" onClick={onCreate}>
            New product
          </button>
        </div>
      </div>
      <div className="admin-toolbar">
        <input
          aria-label="Search products"
          placeholder="Search products, SKU, brand..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          aria-label="Sort products"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="name">Sort by name</option>
          <option value="price">Sort by price</option>
          <option value="stock">Sort by stock</option>
        </select>
      </div>
      {loading ? (
        <p className="muted">Loading products...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      visibleProducts.length > 0 &&
                      selected.length === visibleProducts.length
                    }
                    onChange={toggleAll}
                    aria-label="Select all visible products"
                  />
                </th>
                <th>Image</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(product._id)}
                      onChange={() => toggle(product._id)}
                      aria-label={`Select ${product.name}`}
                    />
                  </td>
                  <td>
                    <img
                      className="admin-product-thumb"
                      src={product.images?.[0]?.url}
                      alt=""
                    />
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                    <small>
                      {product.brand} · {product.images?.length || 0} image(s)
                    </small>
                  </td>
                  <td>{product.sku}</td>
                  <td>{product.category}</td>
                  <td>
                    PHP{" "}
                    {Number(product.salePrice || product.price).toLocaleString(
                      "en-PH",
                      { minimumFractionDigits: 2 },
                    )}
                  </td>
                  <td>{product.stock}</td>
                  <td>
                    <button
                      className="table-button"
                      onClick={() => onEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="table-button danger"
                      onClick={() => removeProduct(product._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleProducts.length && (
            <p className="admin-empty">No products found.</p>
          )}
        </div>
      )}
    </section>
  );
};
export default ProductsList;
