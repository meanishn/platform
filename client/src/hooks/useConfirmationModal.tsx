import { useState } from 'react';
import { ConfirmationModal, ConfirmationModalProps } from '../components/ui/ConfirmationModal';

export const useConfirmationModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Omit<ConfirmationModalProps, 'isOpen' | 'onClose' | 'onConfirm'>>({
    title: '',
    message: '',
  });
  const [confirmCallback, setConfirmCallback] = useState<((reason?: string) => void | Promise<void>) | null>(null);

  const confirm = (
    options: Omit<ConfirmationModalProps, 'isOpen' | 'onClose' | 'onConfirm'>,
    onConfirm: (reason?: string) => void | Promise<void>
  ) => {
    setConfig(options);
    setConfirmCallback(() => onConfirm);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setConfirmCallback(null);
  };

  const handleConfirm = async (reason?: string) => {
    if (confirmCallback) {
      await confirmCallback(reason);
    }
  };

  const ConfirmationModalComponent = (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      {...config}
    />
  );

  return {
    confirm,
    ConfirmationModalComponent,
    isOpen,
  };
};
