import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { errMsg, getToken, successMsg } from "../../Utils/helpers.jsx";
import "./Profile.css";
import { profileSchema, validate } from "../../Utils/validation.js";
import {
  updateProfileSuccess,
  userFail,
  userRequest,
} from "../../actions/userActions.jsx";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();
  const config = { headers: { Authorization: `Bearer ${getToken()}` } };
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/me`, config)
      .then(({ data }) => {
        setUser(data.user);
        setName(data.user.name || "");
        setPreview(data.user.avatar?.url || "");
      })
      .catch(errMsg);
  }, []);
  const selectAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };
  const submit = async (event) => {
    event.preventDefault();
    const validationError = await validate(profileSchema, { name });
    if (validationError) {
      errMsg({ message: validationError });
      return;
    }
    setSaving(true);
    dispatch(userRequest());
    try {
      const form = new FormData();
      form.append("name", name);
      if (avatar) form.append("avatar", avatar);
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/me/update`,
        form,
        config,
      );
      setUser(data.user);
      dispatch(updateProfileSuccess(data.user));
      setPreview(data.user.avatar?.url || "");
      successMsg("Profile updated");
    } catch (error) {
      dispatch(userFail(error?.message || "Unable to update profile"));
      errMsg(error);
    } finally {
      setSaving(false);
    }
  };
  if (!getToken()) return <Navigate to="/login" replace />;
  if (!user)
    return (
      <main className="container">
        <div className="skeleton" />
      </main>
    );
  return (
    <main className="container">
      <section className="profile-panel">
        <div className="eyebrow">Account / Profile</div>
        <h1>Your profile</h1>
        <div className="profile-layout">
          <div className="profile-avatar">
            {preview ? (
              <img src={preview} alt={user.name} />
            ) : (
              <span>{user.name?.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <form className="admin-form" onSubmit={submit}>
            <label>
              Full name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
            <label>
              Email
              <input value={user.email} readOnly />
            </label>
            <label>
              Account role
              <input value={user.role} readOnly />
            </label>
            <label>
              Profile picture
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={selectAvatar}
              />
            </label>
            <button className="add" disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};
export default Profile;
