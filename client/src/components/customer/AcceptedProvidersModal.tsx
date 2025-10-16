/**
 * AcceptedProvidersModal Component
 * Shows list of providers who have accepted a service request
 * Allows customer to select and confirm a provider
 */

import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge } from '../ui';
import { api, handleResponse } from '../../services/apiClient';
import type { PublicUserDto } from '../../types/api';
import { Star, Award, Clock, CheckCircle, Lightbulb } from 'lucide-react';

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
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-slate-100 rounded-lg p-4 h-32"></div>
            ))}
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
              <div
                key={provider.id}
                className={`border-2 rounded-lg p-5 transition-all ${
                  selectedProviderId === provider.id
                    ? 'border-emerald-600 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Provider Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg">
                        {provider.firstName?.[0]}{provider.lastName?.[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">
                          {provider.firstName} {provider.lastName}
                        </h4>
                        {provider.averageRating && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((starNum) => (
                                <Star
                                  key={starNum}
                                  className={`w-4 h-4 ${
                                    starNum <= Math.round(provider.averageRating || 0)
                                      ? 'text-amber-500 fill-amber-500'
                                      : 'text-slate-300 fill-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {provider.averageRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-slate-500">
                              ({provider.totalJobsCompleted} jobs)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Provider Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <div className="text-xs text-slate-600 mb-1">Experience</div>
                        <div className="font-semibold text-slate-900">
                          {provider.totalJobsCompleted || 0} jobs completed
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <div className="text-xs text-slate-600 mb-1">Rating</div>
                        <div className="font-semibold text-slate-900">
                          {provider.averageRating ? `${provider.averageRating.toFixed(1)} / 5.0` : 'No ratings yet'}
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(provider.totalJobsCompleted || 0) > 50 && (
                        <Badge variant="default" className="text-xs flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Experienced
                        </Badge>
                      )}
                      {(provider.averageRating || 0) >= 4.5 && (
                        <Badge variant="success" className="text-xs flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Top Rated
                        </Badge>
                      )}
                      {(provider.totalJobsCompleted || 0) > 0 && (provider.totalJobsCompleted || 0) <= 10 && (
                        <Badge variant="info" className="text-xs flex items-center gap-1">
                          New Provider
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleConfirmProvider(provider.id)}
                  disabled={isConfirming}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center gap-2"
                >
                  {isConfirming && selectedProviderId === provider.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Select {provider.firstName}
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-blue-700" />
            </div>
            <div className="flex-1 text-sm text-slate-600">
              <p className="font-medium text-slate-900 mb-1">How to choose?</p>
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
