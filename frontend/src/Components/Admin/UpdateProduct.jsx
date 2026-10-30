import { useEffect, useState } from "react";
import axios from "axios";
import { errMsg, getToken, successMsg } from "../../Utils/helpers.jsx";
import { productSchema, validate } from "../../Utils/validation.js";

const api = import.meta.env.VITE_API_URL;
const UpdateProduct = ({ product, onSaved, onCancel }) => {
  const [form, setForm] = useState(product);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(product), [product]);
  if (!product || !form) return null;
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const removeImage = async (image) => {
    try {
      await axios.delete(
        `${api}/admin/product/${product._id}/image/${image._id}`,
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      setForm((current) => ({
        ...current,
        images: current.images.filter((item) => item._id !== image._id),
      }));
      successMsg("Image removed");
    } catch (error) {
      errMsg(error);
    }
  };
  const submit = async (event) => {
    event.preventDefault();
    const validationError = await validate(productSchema, {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    });
    if (validationError) {
      errMsg({ message: validationError });
      return;
    }
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries({
        ...form,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : "",
        stock: Number(form.stock),
      }).forEach(([key, value]) => {
        if (
          ![
            "_id",
            "__v",
            "images",
            "reviews",
            "ratings",
            "numOfReviews",
            "createdAt",
            "updatedAt",
          ].includes(key) &&
          value !== undefined
        )
          payload.append(
            key,
            typeof value === "object" ? JSON.stringify(value) : value,
          );
      });
      Array.from(images).forEach((image) => payload.append("images", image));
      await axios.put(`${api}/admin/product/${product._id}`, payload, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      successMsg("Product updated");
      onSaved();
    } catch (error) {
      errMsg(error);
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2>Update product</h2>
        <button className="admin-button secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <form className="admin-form" onSubmit={submit}>
        <div className="form-grid">
          {[
            "name",
            "slug",
            "brand",
            "model",
            "sku",
            "price",
            "salePrice",
            "stock",
            "category",
          ].map((name) => (
            <label key={name}>
              {name}
              <input
                name={name}
                value={form[name] ?? ""}
                onChange={change}
                type={
                  ["price", "salePrice", "stock"].includes(name)
                    ? "number"
                    : "text"
                }
                required={[
                  "name",
                  "slug",
                  "brand",
                  "sku",
                  "price",
                  "stock",
                  "category",
                ].includes(name)}
              />
            </label>
          ))}
          <label>
            Additional images
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => setImages(event.target.files)}
            />
          </label>
        </div>
        <div className="image-manager">
          <strong>Current images</strong>
          <div className="image-manager-grid">
            {form.images?.length ? (
              form.images.map((image) => (
                <div className="managed-image" key={image._id}>
                  <img src={image.url} alt="Product" />
                  <button
                    type="button"
                    className="image-remove"
                    onClick={() => removeImage(image)}
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <span className="muted">No images uploaded.</span>
            )}
          </div>
          {images.length > 0 && (
            <p className="muted">
              {images.length} new image(s) selected. They will be added when you
              save.
            </p>
          )}
        </div>
        <label>
          Description
          <textarea
            name="description"
            value={form.description || ""}
            onChange={change}
            required
            rows="4"
          />
        </label>
        <button className="admin-button" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </section>
  );
};
export default UpdateProduct;
