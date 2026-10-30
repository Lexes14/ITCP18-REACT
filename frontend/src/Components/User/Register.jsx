import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import axios from "axios";
import { auth } from "../../firebase.js";
import { authenticate, errMsg, successMsg } from "../../Utils/helpers.jsx";
import {
  registerSuccess,
  userFail,
  userRequest,
} from "../../actions/userActions.jsx";
const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    dispatch(userRequest());
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(credential.user, { displayName: name });
      const token = await credential.user.getIdToken();
      const form = new FormData();
      form.append("name", name);
      if (avatar) form.append("avatar", avatar);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/sync`,
        form,
        config,
      );
      authenticate({ token, user: data.user });
      dispatch(registerSuccess(data.user));
      successMsg("Account created");
      navigate("/");
    } catch (error) {
      dispatch(userFail(error?.message || "Unable to create account"));
      if (auth.currentUser) await signOut(auth);
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
        <div className="eyebrow">Create your power profile</div>
        <h1>Register</h1>
        <label>
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
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
            minLength="6"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <label>
          Avatar
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setAvatar(event.target.files[0])}
          />
        </label>
        <button className="add" disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
        <p className="muted">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
};
export default Register;
