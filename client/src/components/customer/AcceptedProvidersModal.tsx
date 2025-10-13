/**
 * AcceptedProvidersModal Component
 * Shows list of providers who have accepted a service request
 * Allows customer to select and confirm a provider
 */

import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge } from '../ui';
import { api, handleResponse } from '../../services/apiClient';
import type { PublicUserDto } from '../../types/api';

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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Choose a provider for: {requestTitle}
          </h3>
          <p className="text-sm text-gray-600">
            {providers.length === 1 
              ? '1 provider has accepted your request'
              : `${providers.length} providers have accepted your request`
            }
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-32"></div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-600 font-medium mb-2">No providers yet</p>
            <p className="text-sm text-gray-500">
              We'll notify you when providers accept your request
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className={`border-2 rounded-lg p-5 transition-all ${
                  selectedProviderId === provider.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Provider Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {provider.firstName?.[0]}{provider.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {provider.firstName} {provider.lastName}
                        </h4>
                        {provider.averageRating && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`text-sm ${
                                    star <= Math.round(provider.averageRating || 0)
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {provider.averageRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({provider.totalJobsCompleted} jobs)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Provider Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Experience</div>
                        <div className="font-semibold text-gray-900">
                          {provider.totalJobsCompleted || 0} jobs completed
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Rating</div>
                        <div className="font-semibold text-gray-900">
                          {provider.averageRating ? `${provider.averageRating.toFixed(1)} / 5.0` : 'No ratings yet'}
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(provider.totalJobsCompleted || 0) > 50 && (
                        <Badge variant="primary">
                          <span className="text-xs">🏆 Experienced</span>
                        </Badge>
                      )}
                      {(provider.averageRating || 0) >= 4.5 && (
                        <Badge variant="success">
                          <span className="text-xs">⭐ Top Rated</span>
                        </Badge>
                      )}
                      {(provider.totalJobsCompleted || 0) > 0 && (provider.totalJobsCompleted || 0) <= 10 && (
                        <Badge variant="info">
                          <span className="text-xs">🆕 New Provider</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleConfirmProvider(provider.id)}
                  disabled={isConfirming}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                  {isConfirming && selectedProviderId === provider.id ? (
                    <>
                      <span className="animate-spin inline-block mr-2">⏳</span>
                      Confirming...
                    </>
                  ) : (
                    <>
                      ✓ Select {provider.firstName}
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">💡</span>
            <div className="flex-1 text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-1">How to choose?</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Check their rating and number of completed jobs</li>
                <li>Look for experience badges</li>
                <li>Consider response time (faster acceptance = more eager)</li>
              </ul>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
            disabled={isConfirming}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
