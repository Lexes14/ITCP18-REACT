import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { errMsg, getToken } from "../../Utils/helpers.jsx";
const UserSalesChart = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/admin/customer-sales`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      .then(({ data: response }) => setData(response.data || []))
      .catch(errMsg);
  }, []);
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2>Customer sales</h2>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <XAxis dataKey="name" hide />
          <YAxis />
          <Tooltip
            formatter={(value) => `PHP ${Number(value).toLocaleString()}`}
          />
          <Bar dataKey="total" fill="#854d0e" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
};
export default UserSalesChart;
