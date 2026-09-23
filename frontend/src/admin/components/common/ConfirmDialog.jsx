// ConfirmDialog.jsx
// Reusable confirmation dialog — replaces window.confirm().

import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

const VARIANT_STYLES = {
  danger: {
    icon: "bg-red-100 text-red-600",
    button: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: "bg-amber-100 text-amber-600",
    button: "bg-amber-600 hover:bg-amber-700",
  },
  primary: {
    icon: "bg-indigo-100 text-indigo-600",
    button: "bg-indigo-600 hover:bg-indigo-700",
  },
};

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.danger;

  function handleConfirm() {
    onConfirm();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.icon}`}
          >
            <AlertTriangle size={18} />
          </div>
          <p className="pt-2 text-sm leading-relaxed text-theme-secondary">
            {message}
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary w-full sm:w-auto"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition sm:w-auto ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;