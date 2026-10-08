import { useCallback, useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import Charts from "../components/Charts";

const money = (n) => `Rs ${Number(n).toLocaleString()}`;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([
        api.get("/transactions/summary"),
        api.get("/transactions", { params: typeFilter ? { type: typeFilter } : {} }),
      ]);
      setSummary(s.data);
      setTransactions(t.data);
    } catch {
      setError("Could not load data");
    }
  }, [typeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaved = () => {
    setEditing(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    await api.delete(`/transactions/${id}`);
    loadData();
  };

  return (
    <div className="container">
      <header className="topbar">
        <h2>Expense Tracker</h2>
        <div>
          <span className="muted">Hi, {user.name}</span>
          <button className="btn small" onClick={logout}>Logout</button>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      {summary && (
        <>
          <div className="cards">
            <div className="card stat income">
              <p>Income</p>
              <h3>{money(summary.income)}</h3>
            </div>
            <div className="card stat expense">
              <p>Expenses</p>
              <h3>{money(summary.expense)}</h3>
            </div>
            <div className="card stat balance">
              <p>Balance</p>
              <h3>{money(summary.balance)}</h3>
            </div>
          </div>

          <Charts summary={summary} />
        </>
      )}

      <TransactionForm
        editing={editing}
        onSaved={handleSaved}
        onCancel={() => setEditing(null)}
      />

      <div className="card">
        <div className="list-head">
          <h3>Transactions</h3>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <TransactionList
          items={transactions}
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