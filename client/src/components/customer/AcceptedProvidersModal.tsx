/**
 * AcceptedProvidersModal Component
 * Shows list of providers who have accepted a service request
 * Allows customer to select and confirm a provider
 * 
 * REFACTORED: Following design system and refactor guidelines
 */

import React, { useState, useEffect } from 'react';
import { Modal, Button, LoadingSkeleton, InfoBanner } from '../ui';
import { ProviderSelectionCard } from './ProviderSelectionCard';
import { api, handleResponse } from '../../services/apiClient';
import type { PublicUserDto } from '../../types/api';
import { Clock, Lightbulb } from 'lucide-react';

interface AcceptedProvidersModalProps {
  requestId: number;
  requestTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onProviderConfirmed: () => void;
}

interface AcceptedProvidersResponse {
  providers: PublicUserDto[];
  status: string;
}

export const AcceptedProvidersModal: React.FC<AcceptedProvidersModalProps> = ({
  requestId,
  requestTitle,
  isOpen,
  onClose,
  onProviderConfirmed
}) => {
  const [providers, setProviders] = useState<PublicUserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);

  const fetchAcceptedProviders = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/service-requests/${requestId}/accepted-providers`);
      const data = await handleResponse<{ success: boolean; data: AcceptedProvidersResponse }>(response);
      
      if (data.success && data.data) {
        setProviders(data.data.providers);
      }
    } catch (error) {
      console.error('Failed to fetch accepted providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAcceptedProviders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, requestId]);

  const handleConfirmProvider = async (providerId: number) => {
    try {
      setIsConfirming(true);
      setSelectedProviderId(providerId);
      
      const response = await api.post(`/api/service-requests/${requestId}/confirm`, {
        providerId
      });
      
      await handleResponse(response);
      
      // Notify parent component
      onProviderConfirmed();
      onClose();
    } catch (error) {
      console.error('Failed to confirm provider:', error);
      alert(error instanceof Error ? error.message : 'Failed to confirm provider');
    } finally {
      setIsConfirming(false);
      setSelectedProviderId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Provider"
      size="lg"
      theme="light"
      noPadding={true}
    >
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Choose a provider for: {requestTitle}
          </h3>
          <p className="text-sm text-slate-600">
            {providers.length === 1 
              ? '1 provider has accepted your request'
              : `${providers.length} providers have accepted your request`
            }
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <LoadingSkeleton type="card" count={2} />
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-900 font-medium mb-2">No providers yet</p>
            <p className="text-sm text-slate-600">
              We'll notify you when providers accept your request
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {providers.map((provider) => (
              <ProviderSelectionCard
                key={provider.id}
                provider={provider}
                isSelected={selectedProviderId === provider.id}
                isConfirming={isConfirming && selectedProviderId === provider.id}
                onSelect={handleConfirmProvider}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        {providers.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <InfoBanner
              icon={Lightbulb}
              title="How to choose?"
              message={
                <ul className="space-y-1 list-disc list-inside text-sm">
                  <li>Check their rating and number of completed jobs</li>
                  <li>Look for experience badges</li>
                  <li>Consider response time (faster acceptance = more eager)</li>
                </ul>
              }
              variant="info"
              className="mb-4"
            />
            
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
              disabled={isConfirming}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
