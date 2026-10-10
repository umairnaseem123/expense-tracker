import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Eye, Pencil, Trash2, Search, FilterX } from "lucide-react";
import api from "../api";
import TransactionForm, { CATEGORIES } from "../components/TransactionForm";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import Toast, { useToast } from "../components/Toast";

const money = (n) => `Rs ${Number(n || 0).toLocaleString()}`;
const day = (d) => new Date(d).toLocaleDateString();

const SORTERS = {
  newest: (a, b) => new Date(b.date) - new Date(a.date),
  oldest: (a, b) => new Date(a.date) - new Date(b.date),
  high: (a, b) => b.amount - a.amount,
  low: (a, b) => a.amount - b.amount,
};

export default function Transactions() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("newest");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast, show, hide } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await api.get("/transactions");
      setAll(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch {
      setError("Could not load your transactions. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromD = from ? new Date(`${from}T00:00:00`) : null;
    const toD = to ? new Date(`${to}T23:59:59`) : null;
    const filtered = all.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q)) return false;
      if (type && t.type !== type) return false;
      if (category && t.category !== category) return false;
      const d = new Date(t.date);
      if (fromD && d < fromD) return false;
      if (toD && d > toD) return false;
      return true;
    });
    return filtered.sort(SORTERS[sort]);
  }, [all, search, type, category, from, to, sort]);

  const hasFilters = search || type || category || from || to;
  const resetFilters = () => {
    setSearch("");
    setType("");
    setCategory("");
    setFrom("");
    setTo("");
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setFormOpen(true);
  };
  const closeForm = useCallback(() => setFormOpen(false), []);

  const handleSaved = (message) => {
    setFormOpen(false);
    setEditing(null);
    show(message);
    load();
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/transactions/${deleting._id}`);
      setDeleting(null);
      show("Transaction deleted");
      load();
    } catch {
      setDeleting(null);
      show("Could not delete the transaction. Please try again.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h2>Transactions</h2>
          <p className="muted">{loading ? "Loading..." : `${rows.length} of ${all.length} shown`}</p>
        </div>
        <button className="btn with-icon" onClick={openAdd}>
          <Plus size={16} /> Add transaction
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card filters">
        <div className="field">
          <label>Search</label>
          <div className="search-box">
            <Search size={16} />
            <input placeholder="Search by title" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="field">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="field">
          <label>To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="field">
          <label>Sort by</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="high">Highest amount</option>
            <option value="low">Lowest amount</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <>
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </>
        ) : all.length === 0 ? (
          <div className="empty">
            <h4>No transactions yet</h4>
            <p className="muted">Start tracking your finances by adding your first transaction.</p>
            <button className="btn with-icon" onClick={openAdd}>
              <Plus size={16} /> Add transaction
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="empty">
            <h4>No matching transactions</h4>
            <p className="muted">Try changing your search or filters.</p>
            {hasFilters && (
              <button className="btn ghost with-icon" onClick={resetFilters}>
                <FilterX size={16} /> Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t._id}>
                    <td>{day(t.date)}</td>
                    <td>{t.title}</td>
                    <td>{t.category}</td>
                    <td><span className={`badge ${t.type}`}>{t.type}</span></td>
                    <td className={`amt ${t.type === "income" ? "green" : "red"}`}>
                      {t.type === "income" ? "+" : "-"}{money(t.amount)}
                    </td>
                    <td className="note-cell">{t.note || "-"}</td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn icon-only" title="View" onClick={() => setViewing(t)}>
                          <Eye size={15} />
                        </button>
                        <button className="icon-btn icon-only" title="Edit" onClick={() => openEdit(t)}>
                          <Pencil size={15} />
                        </button>
                        <button className="icon-btn icon-only danger" title="Delete" onClick={() => setDeleting(t)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TransactionForm open={formOpen} editing={editing} onClose={closeForm} onSaved={handleSaved} />

      <Modal open={!!viewing} title="Transaction details" onClose={() => setViewing(null)} width={440}>
        {viewing && (
          <dl className="details">
            <dt>Title</dt><dd>{viewing.title}</dd>
            <dt>Type</dt><dd><span className={`badge ${viewing.type}`}>{viewing.type}</span></dd>
            <dt>Amount</dt><dd>{money(viewing.amount)}</dd>
            <dt>Category</dt><dd>{viewing.category}</dd>
            <dt>Date</dt><dd>{day(viewing.date)}</dd>
            <dt>Notes</dt><dd>{viewing.note || "-"}</dd>
          </dl>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete transaction?"
        message={deleting ? `"${deleting.title}" (${money(deleting.amount)}) will be permanently removed.` : ""}
        loading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />

      <Toast toast={toast} onClose={hide} />
    </div>
  );
}