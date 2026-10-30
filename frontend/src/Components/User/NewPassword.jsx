import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../../firebase.js";
import { errMsg, successMsg } from "../../Utils/helpers.jsx";

const NewPassword = () => {
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const submit = async (event) => {
    event.preventDefault();
    if (password.length < 6 || password !== confirm) {
      errMsg({
        message:
          password !== confirm
            ? "Passwords do not match"
            : "Password must be at least 6 characters",
      });
      return;
    }
    setSaving(true);
    try {
      await confirmPasswordReset(auth, params.get("oobCode"), password);
      successMsg("Password updated");
      navigate("/login");
    } catch (error) {
      errMsg(error);
    } finally {
      setSaving(false);
    }
  };
  return (
    <main className="container">
      <form
        className="filter-panel"
        onSubmit={submit}
        style={{ maxWidth: 520, margin: "20px auto" }}
      >
        <div className="eyebrow">Firebase Authentication</div>
        <h1>Choose a new password</h1>
        <label>
          New password
          <input
            type="password"
            minLength="6"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            minLength="6"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
          />
        </label>
        <button className="add" disabled={saving}>
          {saving ? "Updating..." : "Update password"}
        </button>
        <p>
          <Link to="/login">Back to sign in</Link>
        </p>
      </form>
    </main>
  );
};
export default NewPassword;
