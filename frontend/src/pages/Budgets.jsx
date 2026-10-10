import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import api from "../api";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast, { useToast } from "../components/Toast";
import { CATEGORIES } from "../components/TransactionForm";

const money = (n) => `Rs ${Number(n || 0).toLocaleString()}`;
const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c !== "Salary");

function level(pct) {
  if (pct >= 100) return "exceeded";
  if (pct >= 90) return "critical";
  if (pct >= 80) return "high";
  if (pct >= 70) return "warn";
  return "ok";
}

const MESSAGES = {
  exceeded: "Budget exceeded",
  critical: "90% used",
  high: "80% used",
  warn: "70% used",
};

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast, show, hide } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await api.get("/budgets");
      setBudgets(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch {
      setError("Could not load your budgets. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const closeForm = useCallback(() => setFormOpen(false), []);

  const openAdd = () => {
    setEditing(null);
    const used = budgets.map((b) => b.category);
    setCategory(EXPENSE_CATEGORIES.find((c) => !used.includes(c)) || "Food");
    setAmount("");
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setCategory(b.category);
    setAmount(b.amount);
    setFormError("");
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setFormError("Enter a monthly amount greater than 0");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = { category, amount: Number(amount) };
      if (editing) await api.put(`/budgets/${editing._id}`, payload);
      else await api.post("/budgets", payload);
      setFormOpen(false);
      show(editing ? "Budget updated" : "Budget created");
      load();
    } catch (err) {
      setFormError(
        err.response?.status === 400
          ? err.response.data.message
          : "Something went wrong while saving. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/budgets/${deleting._id}`);
      setDeleting(null);
      show("Budget deleted");
      load();
    } catch {
      setDeleting(null);
      show("Could not delete the budget. Please try again.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h2>Budgets</h2>
          <p className="muted">Monthly spending limits per category</p>
        </div>
        <button className="btn with-icon" onClick={openAdd}>
          <Plus size={16} /> Create budget
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="budget-grid">
          <div className="skeleton tall" />
          <div className="skeleton tall" />
          <div className="skeleton tall" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="card">
          <div className="empty">
            <h4>No budgets created</h4>
            <p className="muted">Create a budget to control your spending.</p>
            <button className="btn with-icon" onClick={openAdd}>
              <Plus size={16} /> Create budget
            </button>
          </div>
        </div>
      ) : (
        <div className="budget-grid">
          {budgets.map((b) => {
            const pct = (b.spent / b.amount) * 100;
            const lvl = level(pct);
            const remaining = b.amount - b.spent;
            return (
              <div key={b._id} className="card budget-card">
                <div className="budget-top">
                  <h3>{b.category}</h3>
                  <div className="row-actions">
                    <button className="icon-btn icon-only" title="Edit" onClick={() => openEdit(b)}>
                      <Pencil size={15} />
                    </button>
                    <button className="icon-btn icon-only danger" title="Delete" onClick={() => setDeleting(b)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="budget-numbers">
                  <div><small>Budget</small><strong>{money(b.amount)}</strong></div>
                  <div><small>Spent</small><strong>{money(b.spent)}</strong></div>
                  <div>
                    <small>{remaining >= 0 ? "Remaining" : "Over by"}</small>
                    <strong>{money(Math.abs(remaining))}</strong>
                  </div>
                </div>

                <div className="progress">
                  <div className={`progress-fill ${lvl}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="budget-foot">
                  <span>{Math.round(pct)}% used</span>
                  {lvl !== "ok" && (
                    <span className={`budget-alert ${lvl}`}>
                      <AlertTriangle size={14} /> {MESSAGES[lvl]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={formOpen} title={editing ? "Edit budget" : "Create budget"} onClose={closeForm} width={420}>
        <form className="modal-form single" onSubmit={handleSubmit} noValidate>
          {formError && <div className="error">{formError}</div>}
          <div className="field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Monthly amount (Rs)</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={closeForm} disabled={saving}>Cancel</button>
            <button className="btn" disabled={saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Create budget"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete budget?"
        message={deleting ? `The ${deleting.category} budget will be removed. Your transactions are not affected.` : ""}
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />

      <Toast toast={toast} onClose={hide} />
    </div>
  );
}