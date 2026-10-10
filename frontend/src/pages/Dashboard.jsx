import { useCallback, useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight } from "lucide-react";
import api from "../api";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import Charts from "../components/Charts";

const money = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

const monthKey = (d) => {
  const x = new Date(d);
  return x.getFullYear() * 12 + x.getMonth();
};

function pctChange(current, previous) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

function StatCard({ label, value, icon: Icon, tone, change, goodWhenUp = true, hint }) {
  let delta = null;
  if (change === undefined) {
    delta = hint ? <span className="delta flat">{hint}</span> : null;
  } else if (change === null) {
    delta = <span className="delta flat">No data last month</span>;
  } else {
    const up = change >= 0;
    const good = up === goodWhenUp;
    delta = (
      <span className={`delta ${good ? "good" : "bad"}`}>
        {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {Math.abs(change).toFixed(1)}% from last month
      </span>
    );
  }

  return (
    <div className="card stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon ${tone}`}><Icon size={18} /></span>
      </div>
      <div className="stat-value">{value}</div>
      {delta}
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [all, setAll] = useState([]);
  const [editing, setEditing] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([api.get("/transactions/summary"), api.get("/transactions")]);
      setSummary(s.data);
      setAll(Array.isArray(t.data) ? t.data : []);
      setError("");
    } catch {
      setError("Could not load data. Please refresh the page.");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const now = new Date();
    const cur = now.getFullYear() * 12 + now.getMonth();
    const sum = { cur: { income: 0, expense: 0 }, prev: { income: 0, expense: 0 } };
    all.forEach((t) => {
      const k = monthKey(t.date);
      const bucket = k === cur ? sum.cur : k === cur - 1 ? sum.prev : null;
      if (bucket) bucket[t.type] += Number(t.amount) || 0;
    });
    const saved = sum.cur.income - sum.cur.expense;
    const rate = sum.cur.income ? (saved / sum.cur.income) * 100 : null;
    return {
      incomeChange: pctChange(sum.cur.income, sum.prev.income),
      expenseChange: pctChange(sum.cur.expense, sum.prev.expense),
      saved,
      rate,
    };
  }, [all]);

  const list = typeFilter ? all.filter((t) => t.type === typeFilter) : all;
  const recent = all.slice(0, 5);

  const handleSaved = () => {
    setEditing(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      loadData();
    } catch {
      setError("Could not delete the transaction. Please try again.");
    }
  };

  return (
    <div className="container">
      {error && <div className="error">{error}</div>}

      {!summary && !error && <p className="muted">Loading your dashboard...</p>}

      {summary && (
        <>
          <div className="cards">
            <StatCard label="Total Income" value={money(summary.income)} icon={TrendingUp} tone="green" change={stats.incomeChange} />
            <StatCard label="Total Expenses" value={money(summary.expense)} icon={TrendingDown} tone="red" change={stats.expenseChange} goodWhenUp={false} />
            <StatCard label="Current Balance" value={money(summary.balance)} icon={Wallet} tone="indigo" hint="All time" />
            <StatCard
              label="Saved This Month"
              value={money(stats.saved)}
              icon={PiggyBank}
              tone="amber"
              hint={stats.rate === null ? "No income this month" : `${stats.rate.toFixed(0)}% of income saved`}
            />
          </div>

          <Charts summary={summary} />

          <div className="card">
            <div className="list-head"><h3>Recent transactions</h3></div>
            {recent.length === 0 ? (
              <p className="muted">No transactions yet. Add your first one below.</p>
            ) : (
              <div className="recent">
                {recent.map((t) => (
                  <div key={t._id} className="recent-row">
                    <span className={`recent-dot ${t.type}`}>
                      {t.type === "income" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </span>
                    <div className="recent-info">
                      <strong>{t.title}</strong>
                      <small>{t.category} • {new Date(t.date).toLocaleDateString()}</small>
                    </div>
                    <span className={`amt ${t.type === "income" ? "green" : "red"}`}>
                      {t.type === "income" ? "+" : "-"}{money(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <TransactionForm editing={editing} onSaved={handleSaved} onCancel={() => setEditing(null)} />

      <div className="card">
        <div className="list-head">
          <h3>All transactions</h3>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <TransactionList
          items={list}
          onEdit={(t) => {
            setEditing(t);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}