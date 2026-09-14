// Modal.jsx
// Reusable modal dialog component.

import { X } from "lucide-react";

function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className={`animate-scale-in w-full ${maxWidth} rounded-2xl border border-theme bg-theme-secondary shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-theme px-6 py-4">
          <h2 className="text-lg font-bold text-theme-primary">{title}</h2>
          <button type="button" onClick={onClose} className="btn-ghost">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;