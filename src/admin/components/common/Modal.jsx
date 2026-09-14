// Modal.jsx
// Fully responsive modal.
// Mobile: bottom sheet (slides up)
// Tablet/Desktop: centered dialog

import { useEffect } from "react";
import { X } from "lucide-react";

function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm",
        "items-end justify-center", // Mobile: bottom
        "sm:items-center sm:p-4",    // Tablet+: centered
        "animate-fade-in",
      ].join(" ")}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={[
          "animate-scale-in w-full bg-theme-secondary shadow-2xl",
          // Mobile: bottom sheet with rounded top
          "max-h-[92vh] overflow-y-auto rounded-t-3xl",
          // Tablet+: centered card with all rounded
          "sm:max-h-[90vh] sm:rounded-2xl",
          // Width
          maxWidth,
          // Border
          "border border-theme",
        ].join(" ")}
      >
        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-12 rounded-full bg-theme-dim/40" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-theme px-5 py-4 sm:px-6 sm:py-4">
          <h2 className="text-base font-bold text-theme-primary sm:text-lg">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;