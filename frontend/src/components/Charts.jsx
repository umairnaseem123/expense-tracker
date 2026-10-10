import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7", "#ec4899", "#84cc16"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const tooltipStyle = {
  contentStyle: { background: "#0b1325", border: "1px solid #334155", borderRadius: 10, color: "#f1f5f9" },
  itemStyle: { color: "#f1f5f9" },
  labelStyle: { color: "#94a3b8" },
};
const fmt = (v) => `Rs ${Number(v).toLocaleString()}`;

export default function Charts({ summary }) {
  const pieData = summary.byCategory.map((c) => ({ name: c._id, value: c.total }));
  const totalExpense = pieData.reduce((a, b) => a + b.value, 0);

  const map = {};
  summary.monthly.forEach((m) => {
    const key = `${MONTHS[m._id.month - 1]} ${m._id.year}`;
    if (!map[key]) map[key] = { month: key, income: 0, expense: 0 };
    map[key][m._id.type] = m.total;
  });
  const barData = Object.values(map);

  return (
    <div className="charts">
      <div className="card">
        <h3>Spending by category</h3>
        {pieData.length === 0 ? (
          <p className="muted">No expenses yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3} stroke="none">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v) => fmt(v)} />
              <Legend />
              <text x="50%" y="46%" textAnchor="middle" fill="#94a3b8" fontSize="12">Total spent</text>
              <text x="50%" y="53%" textAnchor="middle" fill="#f1f5f9" fontSize="18" fontWeight="600">
                {fmt(totalExpense)}
              </text>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h3>Monthly income vs expense</h3>
        {barData.length === 0 ? (
          <p className="muted">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} width={65} />
              <Tooltip {...tooltipStyle} formatter={(v) => fmt(v)} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}