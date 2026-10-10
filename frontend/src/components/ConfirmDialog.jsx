import Modal from "./Modal";

export default function ConfirmDialog({ open, title, message, confirmText = "Delete", loading, onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={onCancel} width={420}>
      <p className="muted" style={{ marginBottom: 20 }}>{message}</p>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="btn danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Deleting..." : confirmText}
        </button>
      </div>
    </Modal>
  );
}