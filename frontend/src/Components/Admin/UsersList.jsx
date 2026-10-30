import { useEffect, useState } from "react";
import axios from "axios";
import { errMsg, getToken, successMsg } from "../../Utils/helpers.jsx";

const api = import.meta.env.VITE_API_URL;
const config = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });
const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = async () => {
    try {
      const { data } = await axios.get(`${api}/admin/users`, config());
      setUsers(data.users || []);
    } catch (error) {
      errMsg(error);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const save = async (user) => {
    try {
      const { data } = await axios.put(
        `${api}/admin/user/${user._id}`,
        { name: user.name, email: user.email, role: user.role },
        config(),
      );
      setUsers((current) =>
        current.map((item) => (item._id === user._id ? data.user : item)),
      );
      setEditing(null);
      successMsg("User updated");
    } catch (error) {
      errMsg(error);
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`${api}/admin/user/${id}`, config());
      setUsers((current) => current.filter((user) => user._id !== id));
      successMsg("User deleted");
    } catch (error) {
      errMsg(error);
    }
  };
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <div className="eyebrow">Access</div>
          <h2>Users</h2>
        </div>
        <span className="muted">{users.length} accounts</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) =>
              editing?._id === user._id ? (
                <tr key={user._id}>
                  <td>
                    <input
                      value={editing.name}
                      onChange={(event) =>
                        setEditing({ ...editing, name: event.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={editing.email}
                      onChange={(event) =>
                        setEditing({ ...editing, email: event.target.value })
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={editing.role}
                      onChange={(event) =>
                        setEditing({ ...editing, role: event.target.value })
                      }
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="table-button"
                      onClick={() => save(editing)}
                    >
                      Save
                    </button>
                    <button
                      className="table-button"
                      onClick={() => setEditing(null)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={user._id}>
                  <td>
                    <strong>{user.name}</strong>
                    <small>{user.firebaseUid}</small>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button
                      className="table-button"
                      onClick={() => setEditing({ ...user })}
                    >
                      Edit
                    </button>
                    <button
                      className="table-button danger"
                      onClick={() => remove(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
export default UsersList;
