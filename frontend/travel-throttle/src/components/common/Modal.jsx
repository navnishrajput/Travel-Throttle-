/**
 * MODAL COMPONENT
 * Reusable modal/dialog component
 */

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/helpers';
import { THEME } from '../../constants';
import Button from './Button';

const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full',
};

const sizeClasses = {
  [MODAL_SIZES.SM]: 'max-w-md',
  [MODAL_SIZES.MD]: 'max-w-lg',
  [MODAL_SIZES.LG]: 'max-w-2xl',
  [MODAL_SIZES.XL]: 'max-w-4xl',
  [MODAL_SIZES.FULL]: 'max-w-[95vw] max-h-[95vh]',
};

/**
 * Modal Component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {string} props.size - Modal size
 * @param {boolean} props.closeOnOverlayClick - Close when clicking overlay
 * @param {boolean} props.showCloseButton - Show close button
 * @param {ReactNode} props.children - Modal content
 * @param {ReactNode} props.footer - Modal footer content
 * @param {string} props.className - Additional classes
 */
export const Modal = ({
  isOpen = false,
  onClose,
  title = '',
  size = MODAL_SIZES.MD,
  closeOnOverlayClick = true,
  showCloseButton = true,
  children,
  footer,
  className = '',
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Focus trap
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      modalRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };
  
  if (!isOpen) return null;
  
  const modalContent = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={handleOverlayClick}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={cn(
            'relative w-full transform overflow-hidden rounded-xl bg-dark-card shadow-2xl transition-all',
            'border border-dark-border',
            sizeClasses[size],
            className
          )}
          tabIndex={-1}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
              {title && (
                <h3 
                  id="modal-title" 
                  className="text-xl font-bold text-white"
                >
                  {title}
                </h3>
              )}
              
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-white hover:bg-dark-bg transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Body */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-dark-border bg-dark-bg/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  // Use portal to render modal at body level
  return createPortal(modalContent, document.body);
};

Modal.SIZES = MODAL_SIZES;

/**
 * Confirmation Modal Helper
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={MODAL_SIZES.SM}
    >
      <p className="text-gray-300 mb-6">{message}</p>
      
      <div className="flex gap-3 justify-end">
        <Button
          variant={Button.VARIANTS.GHOST}
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? Button.VARIANTS.DANGER : Button.VARIANTS.PRIMARY}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

Modal.Confirm = ConfirmModal;

export default Modal;