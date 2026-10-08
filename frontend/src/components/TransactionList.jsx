const money = (n) => `Rs ${Number(n).toLocaleString()}`;

export default function TransactionList({ items, onEdit, onDelete }) {
  if (items.length === 0) {
    return <p className="muted center">No transactions yet. Add your first one above.</p>;
  }

  return (
    <div className="list">
      {items.map((t) => (
        <div className="list-item" key={t._id}>
          <div>
            <strong>{t.title}</strong>
            <p className="muted">
              {t.category} • {new Date(t.date).toLocaleDateString()}
              {t.note ? ` • ${t.note}` : ""}
            </p>
          </div>
          <div className="list-right">
            <span className={t.type === "income" ? "amt green" : "amt red"}>
              {t.type === "income" ? "+" : "-"}{money(t.amount)}
            </span>
            <button className="icon-btn" onClick={() => onEdit(t)}>Edit</button>
            <button className="icon-btn danger" onClick={() => onDelete(t._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}