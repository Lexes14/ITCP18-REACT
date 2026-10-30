import { useState } from "react";
import { useNavigate } from "react-router-dom";
const Shipping = ({ shippingInfo, setShippingInfo }) => {
  const [form, setForm] = useState(shippingInfo);
  const navigate = useNavigate();
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const submit = (event) => {
    event.preventDefault();
    setShippingInfo(form);
    navigate("/checkout/confirm");
  };
  return (
    <main className="container">
      <form
        className="filter-panel"
        onSubmit={submit}
        style={{ maxWidth: 650, margin: "0 auto" }}
      >
        <div className="eyebrow">Checkout / 01</div>
        <h1>Delivery details</h1>
        {[
          ["address", "Address"],
          ["city", "City"],
          ["postalCode", "Postal code"],
          ["country", "Country"],
          ["phoneNo", "Phone number"],
        ].map(([name, label]) => (
          <label key={name}>
            {label}
            <input
              name={name}
              value={form[name] || ""}
              onChange={change}
              required
            />
          </label>
        ))}
        <button className="add">Continue</button>
      </form>
    </main>
  );
};
export default Shipping;
