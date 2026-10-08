import { useEffect, useState } from "react";
import api from "../api";

const CATEGORIES = [
  "Salary", "Food", "Transport", "Shopping", "Bills",
  "Health", "Education", "Entertainment", "Other",
];

const empty = {
  type: "expense",
  title: "",
  amount: "",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

export default function TransactionForm({ editing, onSaved, onCancel }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        type: editing.type,
        title: editing.title,
        amount: editing.amount,
        category: editing.category,
        date: editing.date.slice(0, 10),
        note: editing.note || "",
      });
    } else {
      setForm(empty);
    }
  }, [editing]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) {
        await api.put(`/transactions/${editing._id}`, payload);
      } else {
        await api.post("/transactions", payload);
      }
      setForm(empty);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <h3 className="full">{editing ? "Edit transaction" : "Add transaction"}</h3>

      {error && <div className="error full">{error}</div>}

      <select name="type" value={form.type} onChange={handleChange}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <input
        name="title"
        placeholder="Title (e.g. Groceries)"
        value={form.title}
        onChange={handleChange}
        required
      />

      <input
        name="amount"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
        required
      />

      <select name="category" value={form.category} onChange={handleChange}>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <input name="date" type="date" value={form.date} onChange={handleChange} />

      <input
        name="note"
        placeholder="Note (optional)"
        value={form.note}
        onChange={handleChange}
      />

      <div className="full row">
        <button className="btn" disabled={loading}>
          {loading ? "Saving..." : editing ? "Update" : "Add"}
        </button>
        {editing && (
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}