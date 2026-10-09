import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./Reports.css";

const fmt = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState(currentMonth());
  const [allTime, setAllTime] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/transactions")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.transactions || [];
        setTransactions(data);
      })
      .catch(() => setError("Could not load your transactions. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (allTime) return transactions;
    return transactions.filter((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return key === month;
    });
  }, [transactions, month, allTime]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    const cats = {};
    filtered.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === "income") income += amt;
      else {
        expense += amt;
        cats[t.category] = (cats[t.category] || 0) + amt;
      }
    });
    const breakdown = Object.entries(cats)
      .map(([category, total]) => ({
        category,
        total,
        pct: expense ? (total / expense) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
    return { income, expense, balance: income - expense, breakdown };
  }, [filtered]);

  const exportCSV = () => {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = ["Date", "Title", "Type", "Category", "Amount", "Note"];
    const rows = filtered.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.title,
      t.type,
      t.category,
      t.amount,
      t.note,
    ]);
    const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${allTime ? "all-time" : month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rp">
      <div className="rp-wrap">
        <div className="rp-head">
          <h1>Financial Reports</h1>
          <Link to="/dashboard" className="rp-back">← Back to Dashboard</Link>
        </div>

        <div className="rp-controls">
          <input
            type="month"
            value={month}
            disabled={allTime}
            onChange={(e) => setMonth(e.target.value)}
          />
          <label>
            <input type="checkbox" checked={allTime} onChange={(e) => setAllTime(e.target.checked)} />
            All time
          </label>
          <button onClick={exportCSV} disabled={!filtered.length}>Export CSV</button>
        </div>

        {loading && <p className="rp-muted">Loading report...</p>}
        {error && <p className="rp-error">{error}</p>}

        {!loading && !error && (
          <>
            <div className="rp-cards">
              <div className="rp-card"><small>Total Income</small><strong className="up">{fmt(summary.income)}</strong></div>
              <div className="rp-card"><small>Total Expenses</small><strong className="down">{fmt(summary.expense)}</strong></div>
              <div className="rp-card"><small>Balance</small><strong>{fmt(summary.balance)}</strong></div>
            </div>

            <div className="rp-panel">
              <h2>Category breakdown</h2>
              {summary.breakdown.length === 0 ? (
                <p className="rp-muted">No expenses for this period.</p>
              ) : (
                <div className="rp-scroll">
                  <table>
                    <thead>
                      <tr><th>Category</th><th>Total</th><th>Share</th></tr>
                    </thead>
                    <tbody>
                      {summary.breakdown.map((b) => (
                        <tr key={b.category}>
                          <td>{b.category}</td>
                          <td>{fmt(b.total)}</td>
                          <td>
                            <div className="rp-bar"><div style={{ width: `${b.pct}%` }} /></div>
                            {b.pct.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rp-panel">
              <h2>Transactions ({filtered.length})</h2>
              {filtered.length === 0 ? (
                <p className="rp-muted">No transactions for this period.</p>
              ) : (
                <div className="rp-scroll">
                  <table>
                    <thead>
                      <tr><th>Date</th><th>Title</th><th>Category</th><th>Amount</th></tr>
                    </thead>
                    <tbody>
                      {filtered.map((t) => (
                        <tr key={t._id}>
                          <td>{new Date(t.date).toLocaleDateString()}</td>
                          <td>{t.title}</td>
                          <td>{t.category}</td>
                          <td className={t.type === "income" ? "up" : "down"}>
                            {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}