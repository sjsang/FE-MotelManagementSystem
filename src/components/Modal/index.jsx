import { useEffect } from "react";

const Modal = ({ id, open, onClose, title, children, footer }) => {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className={`modal-backdrop${open ? " open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-inner">
        <div className="py-4.5 px-5.5 pb-3.5 border-b border-(--border) flex items-center justify-between">
          <div className="text-[15px] font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="size-7 rounded-[7px] border border-(--border2) bg-white flex items-center justify-center cursor-pointer text-base text-(--text2)"
          >
            <i className="ti ti-x" />
          </button>
        </div>
        <div className="py-5 px-5.5">{children}</div>
        {footer && (
          <div className="py-3.5 px-5.5 border-t border-(--border) flex justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
