import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase.js";
import { errMsg, successMsg } from "../../Utils/helpers.jsx";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/password/reset`,
        handleCodeInApp: true,
      });
      successMsg("Password reset email sent");
    } catch (error) {
      errMsg(error);
    }
  };
  return (
    <main className="container">
      <form
        className="filter-panel"
        onSubmit={submit}
        style={{ maxWidth: 520, margin: "20px auto" }}
      >
        <h1>Reset password</h1>
        <p className="muted">
          Firebase will email a secure password reset link.
        </p>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <button className="add">Send reset email</button>
        <p>
          <Link to="/login">Back to sign in</Link>
        </p>
      </form>
    </main>
  );
};
export default ForgotPassword;
