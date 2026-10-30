import { useState } from "react";
import axios from "axios";
import { errMsg, getToken, successMsg } from "../../Utils/helpers.jsx";
import { productSchema, validate } from "../../Utils/validation.js";

const api = import.meta.env.VITE_API_URL;
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
const initial = {
  name: "",
  slug: "",
  brand: "",
  model: "",
  description: "",
  price: "",
  salePrice: "",
  stock: "",
  sku: "",
  category: categories[0],
};

const NewProduct = ({ onSaved, onCancel }) => {
  const [form, setForm] = useState(initial);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
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
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      Array.from(images).forEach((image) => body.append("images", image));
      await axios.post(`${api}/admin/product/new`, body, {
        headers: { ...{ Authorization: `Bearer ${getToken()}` } },
      });
      successMsg("Product created");
      setForm(initial);
      setImages([]);
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
        <h2>New product</h2>
        <button className="admin-button secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <form className="admin-form" onSubmit={submit}>
        <div className="form-grid">
          {[
            ["name", "Name"],
            ["slug", "Slug"],
            ["brand", "Brand"],
            ["model", "Model"],
            ["sku", "SKU"],
            ["price", "Price"],
            ["salePrice", "Sale price"],
            ["stock", "Stock"],
          ].map(([name, label]) => (
            <label key={name}>
              {label}
              <input
                name={name}
                value={form[name]}
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
                ].includes(name)}
              />
            </label>
          ))}
          <label>
            Category
            <select name="category" value={form.category} onChange={change}>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            Images
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => setImages(event.target.files)}
            />
          </label>
        </div>
        {images.length > 0 && (
          <div className="image-manager">
            <strong>Selected images</strong>
            <p className="muted">
              {images.length} image(s) will be uploaded to Cloudinary.
            </p>
            <div className="image-manager-grid">
              {Array.from(images).map((image) => (
                <div
                  className="managed-image"
                  key={`${image.name}-${image.lastModified}`}
                >
                  <img src={URL.createObjectURL(image)} alt={image.name} />
                </div>
              ))}
            </div>
          </div>
        )}
        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={change}
            required
            rows="4"
          />
        </label>
        <button className="admin-button" disabled={saving}>
          {saving ? "Saving..." : "Create product"}
        </button>
      </form>
    </section>
  );
};
export default NewProduct;
