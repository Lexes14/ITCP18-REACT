import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { errMsg } from "../../Utils/helpers.jsx";
import Loader from "../Layout/Loader.jsx";
import "./ProductMedia.css";

const ProductDetails = ({ addItemToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [watts, setWatts] = useState(100);
  const [loading, setLoading] = useState(true);
  const touchStartX = useRef(null);
  const getProduct = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/product/${id}`,
      );
      setProduct(data.product);
    } catch (error) {
      errMsg(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getProduct();
  }, [id]);
  useEffect(() => {
    setSelectedImage(0);
  }, [product]);
  if (loading)
    return (
      <main className="container">
        <Loader label="Loading product..." fullPage />
      </main>
    );
  if (!product)
    return (
      <main className="container">
        <h2>Product unavailable</h2>
      </main>
    );
  const images = product.images || [];
  const showPreviousImage = () =>
    setSelectedImage((current) => (current - 1 + images.length) % images.length);
  const showNextImage = () =>
    setSelectedImage((current) => (current + 1) % images.length);
  const handleImageKeyDown = (event) => {
    if (event.key === "ArrowLeft") showPreviousImage();
    if (event.key === "ArrowRight") showNextImage();
  };
  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };
  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(distance) > 40) {
      if (distance > 0) showPreviousImage();
      else showNextImage();
    }
    touchStartX.current = null;
  };
  const runtime =
    product.specs?.capacityWatts && watts > 0
      ? Math.max(
          0,
          Math.round(
            (product.specs.capacityWatts / watts) *
              (product.specs.ampHours || 1) *
              0.7,
          ),
        )
      : 0;
  return (
    <main className="container">
      <div className="product-detail-media">
        {images.length ? (
          <>
            <div
              className="product-image-carousel"
              tabIndex="0"
              role="region"
              aria-label={`${product.name} image gallery`}
              onKeyDown={handleImageKeyDown}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                className="product-detail-image"
                src={images[selectedImage]?.url}
                alt={`${product.name} image ${selectedImage + 1} of ${images.length}`}
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="carousel-button carousel-previous"
                    onClick={showPreviousImage}
                    aria-label="Show previous product image"
                  >
                    &#8249;
                  </button>
                  <button
                    type="button"
                    className="carousel-button carousel-next"
                    onClick={showNextImage}
                    aria-label="Show next product image"
                  >
                    &#8250;
                  </button>
                  <span className="carousel-counter">
                    {selectedImage + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
            <div className="product-thumbnails">
              {images.map((image, index) => (
                <button
                  type="button"
                  className={index === selectedImage ? "selected" : ""}
                  key={image._id || image.public_id || image.url}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image.url} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="product-detail-placeholder">
            No product image available
          </div>
        )}
      </div>
      <div className="eyebrow">
        {product.brand} / {product.sku}
      </div>
      <h1>{product.name}</h1>
      <p className="muted">{product.description}</p>
      <div className="spec-strip">
        <span className="spec-chip">{product.specs?.capacityVA} VA</span>
        <span className="spec-chip">{product.specs?.capacityWatts} W</span>
        <span className="spec-chip">{product.specs?.batteryType}</span>
        <span className="spec-chip">{product.specs?.formFactor}</span>
      </div>
      <h2>
        PHP{" "}
        {(product.salePrice || product.price).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
        })}
      </h2>
      <button className="add" onClick={() => addItemToCart(product)}>
        Add to cart
      </button>
      <section
        className="filter-panel"
        style={{ marginTop: 32, maxWidth: 600 }}
      >
        <div className="eyebrow">Runtime estimator</div>
        <h2>How long will it hold?</h2>
        <p className="muted">
          A directional estimate based on rated capacity, battery size and a 70%
          efficiency factor.
        </p>
        <label>
          Connected load in watts
          <input
            type="number"
            min="1"
            value={watts}
            onChange={(event) => setWatts(Number(event.target.value))}
          />
        </label>
        <div className="price" style={{ marginTop: 18 }}>
          {runtime ? `≈ ${runtime} minutes` : "Enter a valid load"}
        </div>
      </section>
    </main>
  );
};
export default ProductDetails;
