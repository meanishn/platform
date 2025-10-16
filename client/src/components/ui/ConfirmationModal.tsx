import React, { useState } from 'react';
import { Modal, Button } from './';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';

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
  icon?: LucideIcon;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Close',
  confirmVariant = 'primary',
  requireReason = false,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Please provide a reason...',
  warningMessage,
  icon: IconComponent,
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
      theme="light"
    >
      <div className="space-y-4">
        {/* Icon & Message */}
        <div className="flex items-start gap-3">
          {IconComponent && (
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-5 h-5 text-slate-600" strokeWidth={2} />
            </div>
          )}
          <p className="text-slate-700 flex-1">{message}</p>
        </div>

        {/* Reason Input (if required) */}
        {requireReason && (
          <div>
            <label className="block text-slate-700 text-sm mb-2">
              {reasonLabel} <span className="text-red-600">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              className="w-full px-4 py-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 min-h-[120px] resize-none"
              autoFocus
              disabled={isSubmitting}
            />
            {!reason.trim() && (
              <p className="text-red-600 text-xs mt-1">This field is required</p>
            )}
          </div>
        )}

        {/* Warning Message */}
        {warningMessage && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-900 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
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

