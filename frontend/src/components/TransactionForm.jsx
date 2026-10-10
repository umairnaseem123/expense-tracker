import { useEffect, useState } from "react";
import api from "../api";
import Modal from "./Modal";

export const CATEGORIES = [
  "Salary", "Food", "Transport", "Shopping", "Bills",
  "Health", "Education", "Entertainment", "Other",
];

const makeEmpty = () => ({
  type: "expense",
  title: "",
  amount: "",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
  note: "",
});

const validate = (f) => {
  const e = {};
  if (!f.title.trim()) e.title = "Title is required";
  if (!f.amount || Number(f.amount) <= 0) e.amount = "Enter an amount greater than 0";
  if (!f.date) e.date = "Pick a date";
  return e;
};

export default function TransactionForm({ open, editing, onClose, onSaved }) {
  const [form, setForm] = useState(makeEmpty());
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setServerError("");
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
      setForm(makeEmpty());
    }
  }, [open, editing]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    setServerError("");
    try {
      const payload = { ...form, title: form.title.trim(), amount: Number(form.amount) };
      if (editing) await api.put(`/transactions/${editing._id}`, payload);
      else await api.post("/transactions", payload);
      onSaved(editing ? "Transaction updated" : "Transaction added");
    } catch (err) {
      const status = err.response?.status;
      setServerError(
        status === 400
          ? err.response.data.message
          : "Something went wrong while saving. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} title={editing ? "Edit transaction" : "Add transaction"} onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit} noValidate>
        {serverError && <div className="error full">{serverError}</div>}

        <div className="field">
          <label>Type</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className="field">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="field full">
          <label>Title</label>
          <input
            name="title"
            className={errors.title ? "input-invalid" : ""}
            placeholder="e.g. Groceries"
            value={form.title}
            onChange={handleChange}
          />
          {errors.title && <div className="field-error">{errors.title}</div>}
        </div>

        <div className="field">
          <label>Amount (Rs)</label>
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            className={errors.amount ? "input-invalid" : ""}
            placeholder="0"
            value={form.amount}
            onChange={handleChange}
          />
          {errors.amount && <div className="field-error">{errors.amount}</div>}
        </div>

        <div className="field">
          <label>Date</label>
          <input
            name="date"
            type="date"
            className={errors.date ? "input-invalid" : ""}
            value={form.date}
            onChange={handleChange}
          />
          {errors.date && <div className="field-error">{errors.date}</div>}
        </div>

        <div className="field full">
          <label>Notes (optional)</label>
          <input name="note" placeholder="Add a short note" value={form.note} onChange={handleChange} />
        </div>

        <div className="full modal-actions">
          <button type="button" className="btn ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn" disabled={loading}>
            {loading ? "Saving..." : editing ? "Save changes" : "Add transaction"}
          </button>
        </div>
      </form>
    </Modal>
  );
}