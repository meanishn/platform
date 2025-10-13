import React, { useState } from 'react';
import { Modal, Button } from './';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'secondary';
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  warningMessage?: string;
  icon?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  requireReason = false,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Please provide a reason...',
  warningMessage,
  icon,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      // Could add a notification here
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(requireReason ? reason : undefined);
      handleClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
    >
      <div className="space-y-4">
        {/* Icon & Message */}
        <div className="flex items-start gap-3">
          {icon && <span className="text-3xl flex-shrink-0">{icon}</span>}
          <p className="text-white/80 flex-1">{message}</p>
        </div>

        {/* Reason Input (if required) */}
        {requireReason && (
          <div>
            <label className="block text-white/70 text-sm mb-2">
              {reasonLabel} <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px] resize-none"
              autoFocus
              disabled={isSubmitting}
            />
            {!reason.trim() && (
              <p className="text-red-400 text-xs mt-1">This field is required</p>
            )}
          </div>
        )}

        {/* Warning Message */}
        {warningMessage && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-200 text-sm flex items-start gap-2">
              <span className="text-base">⚠️</span>
              <span>{warningMessage}</span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleConfirm}
            variant={confirmVariant}
            className="flex-1"
            disabled={isSubmitting || (requireReason && !reason.trim())}
            isLoading={isSubmitting}
          >
            {confirmText}
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

