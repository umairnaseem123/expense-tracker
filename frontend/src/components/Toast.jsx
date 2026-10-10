import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = "success") => setToast({ message, type, id: Date.now() }), []);
  const hide = useCallback(() => setToast(null), []);
  return { toast, show, hide };
}

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const Icon = toast.type === "error" ? AlertCircle : CheckCircle2;
  return (
    <div className={`toast ${toast.type}`}>
      <Icon size={18} />
      {toast.message}
    </div>
  );
}