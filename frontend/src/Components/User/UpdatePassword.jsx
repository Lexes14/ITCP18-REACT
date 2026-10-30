import { useState } from "react";
import { updatePassword } from "firebase/auth";
import { auth } from "../../firebase.js";
import { errMsg, successMsg } from "../../Utils/helpers.jsx";
const UpdatePassword = () => {
  const [password, setPassword] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    try {
      await updatePassword(auth.currentUser, password);
      successMsg("Password updated in Firebase");
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
        <h1>Update password</h1>
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
        <button className="add">Update password</button>
      </form>
    </main>
  );
};
export default UpdatePassword;
