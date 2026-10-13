import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal d-block fade show"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(5, 10, 25, 0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content soc-card border-cyan">
          <div className="modal-header border-bottom border-secondary pb-3">
            <h5 className="modal-title fw-bold text-bright">{title}</h5>
            <button
              type="button"
              className="btn text-muted p-0 border-0"
              onClick={onClose}
              aria-label="Close"
            >
              <FiX size={22} />
            </button>
          </div>
          <div className="modal-body py-4">{children}</div>
          {footer && <div className="modal-footer border-top border-secondary pt-3">{footer}</div>}
        </div>
      </div>
    </div>
  );
};
