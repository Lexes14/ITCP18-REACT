import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import axios from "axios";
import { auth } from "../../firebase.js";
import { authenticate, errMsg, successMsg } from "../../Utils/helpers.jsx";
import { loginSchema, validate } from "../../Utils/validation.js";
import {
  loginSuccess,
  userFail,
  userRequest,
} from "../../actions/userActions.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const finishLogin = async (credential) => {
    const token = await credential.user.getIdToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/users/sync`,
      {
        name:
          credential.user.displayName || credential.user.email.split("@")[0],
      },
      config,
    );
    authenticate({ token, user: data.user });
    dispatch(loginSuccess(data.user));
    successMsg("Signed in");
    navigate(data.user.role === "admin" ? "/dashboard" : "/");
  };
  const submit = async (event) => {
    event.preventDefault();
    const validationError = await validate(loginSchema, { email, password });
    if (validationError) {
      errMsg({ message: validationError });
      return;
    }
    setLoading(true);
    dispatch(userRequest());
    try {
      await finishLogin(
        await signInWithEmailAndPassword(auth, email, password),
      );
    } catch (error) {
      dispatch(userFail(error?.message || "Unable to sign in"));
      errMsg(error);
    } finally {
      setLoading(false);
    }
  };
  const googleLogin = async () => {
    setLoading(true);
    try {
      await finishLogin(await signInWithPopup(auth, new GoogleAuthProvider()));
    } catch (error) {
      errMsg(error);
    } finally {
      setLoading(false);
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
        <h1>Sign in</h1>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button className="add" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <button
          type="button"
          className="category active"
          style={{ width: "100%", textAlign: "center", marginTop: 10 }}
          disabled={loading}
          onClick={googleLogin}
        >
          Continue with Google
        </button>
        <p className="muted">
          No account? <Link to="/register">Create one</Link> ·{" "}
          <Link to="/password/forgot">Reset password</Link>
        </p>
      </form>
    </main>
  );
};
export default Login;
