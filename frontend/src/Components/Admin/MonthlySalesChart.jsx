import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { errMsg, getToken } from "../../Utils/helpers.jsx";
const MonthlySalesChart = () => {
  const [data, setData] = useState([]);
  const [range, setRange] = useState({ startDate: "", endDate: "" });
  const load = async () => {
    try {
      const query = new URLSearchParams(
        Object.entries(range).filter(([, value]) => value),
      );
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/sales-per-month?${query}`,
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      setData(response.data.data || []);
    } catch (error) {
      errMsg(error);
    }
  };
  useEffect(() => {
    load();
  }, [range.startDate, range.endDate]);
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <div className="eyebrow">Analytics</div>
          <h2>Monthly sales</h2>
        </div>
        <div className="chart-filters">
          <input
            type="date"
            value={range.startDate}
            onChange={(event) =>
              setRange({ ...range, startDate: event.target.value })
            }
          />
          <input
            type="date"
            value={range.endDate}
            onChange={(event) =>
              setRange({ ...range, endDate: event.target.value })
            }
          />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value) => `PHP ${Number(value).toLocaleString()}`}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#65a30d"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
};
export default MonthlySalesChart;
