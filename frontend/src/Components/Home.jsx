import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { errMsg } from "../Utils/helpers.jsx";
import Loader from "./Layout/Loader.jsx";
import "./Product/ProductMedia.css";
import "./HomeFilters.css";
import { getProducts as fetchProducts } from "../actions/productActions.jsx";

const categories = [
  "Line-Interactive UPS",
  "Online Double-Conversion UPS",
  "Standby UPS",
  "Replacement Batteries",
  "Surge Protectors",
  "Power Inverters",
  "Voltage Regulators (AVR)",
  "Solar Batteries",
  "Rack Accessories",
  "Cables & Connectors",
];
const ProductMedia = ({ product }) => (
  <div className="product-media">
    {product.images?.[0]?.url ? (
      <img src={product.images[0].url} alt={product.name} />
    ) : (
      <span>UPS BATTERY STORE</span>
    )}
  </div>
);
const ProductCard = ({ product, addItemToCart }) => (
  <article className="product-card">
    <ProductMedia product={product} />
    <div className="brand-line">
      {product.brand} / {product.sku}
    </div>
    <h3>
      <Link to={`/product/${product._id}`}>{product.name}</Link>
    </h3>
    <span className="muted">{product.category}</span>
    <div className="spec-strip">
      <span className="spec-chip">{product.specs?.capacityVA || 0} VA</span>
      <span className="spec-chip">{product.specs?.capacityWatts || 0} W</span>
      <span className="spec-chip">
        {product.specs?.batteryType || "External"}
      </span>
    </div>
    <div className="price-row">
      <span className="price">
        PHP{" "}
        {(product.salePrice || product.price).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
        })}
      </span>
      <button className="add" onClick={() => addItemToCart(product)}>
        Add to cart
      </button>
    </div>
  </article>
);

const Home = ({ addItemToCart }) => {
  const { keyword } = useParams();
  const products = useSelector((state) => state.products.products);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState("");
  const [batteryType, setBatteryType] = useState("");
  const [rating, setRating] = useState("");
  const [maxPrice, setMaxPrice] = useState(160000);
  const requestController = useRef(null);
  const getProducts = async (nextPage = 1, append = false) => {
    if (!append) {
      requestController.current?.abort();
      requestController.current = new AbortController();
    }
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const params = new URLSearchParams({
        page: nextPage,
        ...(keyword ? { keyword } : {}),
        ...(category ? { category } : {}),
        ...(batteryType ? { "specs[batteryType]": batteryType } : {}),
        ...(rating ? { rating: `gte:${rating}` } : {}),
        "price[lte]": maxPrice,
      });
      const data = await dispatch(
        fetchProducts(params.toString(), append, {
          signal: requestController.current?.signal,
        }),
      );
      setPage(nextPage);
      setHasMore((data.products || []).length === data.resPerPage);
    } catch (error) {
      if (error.code === "ERR_CANCELED") return;
      errMsg(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  useEffect(() => {
    getProducts();
  }, [keyword, category, batteryType, rating, maxPrice]);
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 500 &&
        hasMore &&
        !loadingMore &&
        !loading
      )
        getProducts(page + 1, true);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [page, hasMore, loadingMore, loading]);
  return (
    <main className="container">
      {loading && <Loader label="Loading store data..." fullPage />}
      <section className="hero">
        <div>
          <div className="eyebrow">Continuity, specified</div>
          <h1>Keep the critical things running.</h1>
          <p>
            UPS systems, replacement batteries and power hardware selected for
            real-world uptime.
          </p>
        </div>
      </section>
      <div className="section-head">
        <div>
          <div className="eyebrow">Inventory / 01</div>
          <h2>{keyword ? `Search: ${keyword}` : "Power equipment in stock"}</h2>
        </div>
        <span className="muted">{products.length} systems loaded</span>
      </div>
      <div className="shop-layout">
        <aside className="filter-panel">
          <h3>System filters</h3>
          <button
            className={`category ${!category ? "active" : ""}`}
            onClick={() => setCategory("")}
          >
            All categories
          </button>
          {categories.map((item) => (
            <button
              className={`category ${category === item ? "active" : ""}`}
              key={item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
          <label>
            Battery chemistry
            <select
              value={batteryType}
              onChange={(event) => setBatteryType(event.target.value)}
            >
              <option value="">Any chemistry</option>
              <option>SLA</option>
              <option>AGM</option>
              <option>Gel</option>
              <option>LiFePO4</option>
              <option>Li-ion</option>
            </select>
          </label>
          <label>
            Minimum rating
            <select
              value={rating}
              onChange={(event) => setRating(event.target.value)}
            >
              <option value="">Any rating</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </label>
          <label className="price-filter">
            Maximum price{" "}
            <output>PHP {maxPrice.toLocaleString("en-PH")}</output>
            <input
              type="range"
              min="0"
              max="160000"
              step="500"
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
            />
            <span className="filter-range">
              <span>PHP 0</span>
              <span>PHP 160,000</span>
            </span>
          </label>
        </aside>
        <section className="product-grid">
          {loading ? (
            <Loader label="Loading products..." />
          ) : (
            products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                addItemToCart={addItemToCart}
              />
            ))
          )}
          {!loading && !products.length && (
            <p className="muted">No products match these filters.</p>
          )}
          {loadingMore && <p className="muted">Loading more products...</p>}
          {!hasMore && products.length > 0 && (
            <p className="muted">You reached the end of the catalog.</p>
          )}
        </section>
      </div>
    </main>
  );
};
export default Home;
