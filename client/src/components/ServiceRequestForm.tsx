/**
 * ServiceRequestForm Component
 * 
 * Multi-step form for creating service requests.
 * REFACTORED: Following design system and refactor guidelines.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Input,
  LoadingSkeleton,
  FormStepHeader,
  FormFieldWithLabel,
  CategorySelectionCard,
  TierSelectionCard,
  UrgencySelector,
  CostEstimateCard,
} from './ui';
import type { UrgencyLevel } from './ui';
import { useNotificationService } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';
import { serviceApi, requestApi } from '../services/apiService';
import { ServiceCategoryDto, ServiceTierDto, CreateServiceRequestDto } from '../types/api';
import { Send } from 'lucide-react';

interface ServiceRequestFormData {
  categoryId: number | null;
  tierId: number | null;
  title: string;
  description: string;
  address: string;
  preferredDate: string;
  estimatedHours: number;
  urgency: UrgencyLevel;
}

interface ServiceRequestFormProps {
  onSubmit?: (data: ServiceRequestFormData) => void;
  onCancel?: () => void;
}

export const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const notify = useNotificationService();
  const { user } = useAuth();
  const [categories, setCategories] = useState<ServiceCategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryDto | null>(null);
  const [tiers, setTiers] = useState<ServiceTierDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ServiceRequestFormData>({
    categoryId: null,
    tierId: null,
    title: '',
    description: '',
    address: '',
    preferredDate: '',
    estimatedHours: 1,
    urgency: 'medium'
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await serviceApi.getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        notify.error('Error', 'Failed to load service categories. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryChange = useCallback(async (categoryId: string) => {
    const category = categories.find(c => c.id === parseInt(categoryId));
    setSelectedCategory(category || null);
    setFormData(prev => ({
      ...prev,
      categoryId: parseInt(categoryId) || null,
      tierId: null // Reset tier selection when category changes
    }));

    // Load tiers for the selected category
    if (categoryId) {
      try {
        const response = await serviceApi.getCategoryTiers(parseInt(categoryId));
        if (response.success && response.data) {
          setTiers(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch tiers:', error);
        notify.error('Error', 'Failed to load service tiers.');
      }
    } else {
      setTiers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const handleTierChange = useCallback((tierId: string) => {
    setFormData(prev => ({
      ...prev,
      tierId: parseInt(tierId) || null
    }));
  }, []);

  const handleInputChange = useCallback((field: keyof ServiceRequestFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = useCallback((): string | null => {
    if (!formData.categoryId) return 'Please select a service category';
    if (!formData.tierId) return 'Please select a service tier';
    if (!formData.title.trim()) return 'Please enter a title';
    if (!formData.description.trim()) return 'Please enter a description';
    if (!formData.address.trim()) return 'Please enter an address';
    if (formData.estimatedHours < 1) return 'Estimated hours must be at least 1';

    return null;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      notify.error('Validation Error', validationError);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const requestData: CreateServiceRequestDto = {
        categoryId: formData.categoryId!,
        tierId: formData.tierId!,
        title: formData.title,
        description: formData.description,
        address: formData.address,
        latitude: user?.latitude || 0, // TODO: Get actual coordinates
        longitude: user?.longitude || 0, // TODO: Get actual coordinates
        preferredDate: formData.preferredDate || undefined,
        urgency: formData.urgency,
        estimatedHours: formData.estimatedHours
      };

      const response = await requestApi.createRequest(requestData);

      if (response.success) {
        // Show success notification
        notify.serviceRequest(
          'Request Submitted Successfully!',
          'Your service request has been sent to providers. You will receive notifications when providers respond.',
          {
            actionUrl: '/customer/requests',
            actionText: 'View My Requests'
          }
        );

        // Call onSubmit callback if provided
        if (onSubmit) {
          onSubmit(formData);
        }

        // Reset form
        setFormData({
          categoryId: null,
          tierId: null,
          title: '',
          description: '',
          address: '',
          preferredDate: '',
          estimatedHours: 1,
          urgency: 'medium'
        });
        setSelectedCategory(null);
        setTiers([]);

      } else {
        throw new Error(response.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      notify.error(
        'Submission Failed',
        error instanceof Error ? error.message : 'Failed to submit your request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, notify, onSubmit, user]);

  const selectedTier = tiers.find(t => t.id === formData.tierId);
  const baseRate = selectedTier?.baseHourlyRate ? Number(selectedTier.baseHourlyRate) : 0;
  const hours = formData.estimatedHours > 0 ? formData.estimatedHours : 0;
  const estimatedCost = baseRate * hours;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card className="p-8">
          <LoadingSkeleton type="card" count={3} />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-8">
          <h2 className="text-3xl font-bold mb-2 text-slate-900">Request a Service</h2>
          <p className="text-slate-600">Tell us what you need and we'll connect you with qualified providers</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Step 1: Service Category Selection */}
          <div className="space-y-4">
            <FormStepHeader stepNumber={1} title="Choose Service Category" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <CategorySelectionCard
                  key={category.id}
                  category={category}
                  isSelected={formData.categoryId === category.id}
                  onSelect={handleCategoryChange}
                />
              ))}
            </div>
          </div>

          {/* Step 2: Service Tier Selection */}
          {selectedCategory && tiers.length > 0 && (
            <div className="space-y-4">
              <FormStepHeader stepNumber={2} title="Select Service Tier" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tiers.map((tier, index) => (
                  <TierSelectionCard
                    key={tier.id}
                    tier={tier}
                    isSelected={formData.tierId === tier.id}
                    tierIndex={index}
                    onSelect={handleTierChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Service Details */}
          {formData.tierId && (
            <div className="space-y-6">
              <FormStepHeader stepNumber={3} title="Service Details" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Title */}
                <FormFieldWithLabel
                  label="Service Title"
                  required
                  className="md:col-span-2"
                >
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Fix leaking kitchen faucet"
                    className="w-full text-lg"
                  />
                </FormFieldWithLabel>

                {/* Service Description */}
                <FormFieldWithLabel
                  label="Description"
                  required
                  className="md:col-span-2"
                >
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the service you need in detail..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all text-slate-900 placeholder-slate-400 bg-white"
                  />
                </FormFieldWithLabel>

                {/* Address */}
                <FormFieldWithLabel
                  label="Service Address"
                  required
                  className="md:col-span-2"
                >
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter the address where service is needed"
                    className="w-full"
                  />
                </FormFieldWithLabel>

                {/* Preferred Date */}
                <FormFieldWithLabel
                  label="Preferred Date & Time"
                  helpText="When would you like the service to be done?"
                >
                  <Input
                    type="datetime-local"
                    value={formData.preferredDate}
                    onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                    className="w-full"
                  />
                </FormFieldWithLabel>

                {/* Estimated Hours */}
                <FormFieldWithLabel
                  label="Estimated Hours"
                  required
                  helpText="How many hours do you think this will take?"
                >
                  <Input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.estimatedHours.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || value === '0') {
                        handleInputChange('estimatedHours', 0);
                      } else {
                        const parsed = parseFloat(value);
                        handleInputChange('estimatedHours', isNaN(parsed) ? 0 : parsed);
                      }
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value);
                      if (isNaN(value) || value < 1) {
                        handleInputChange('estimatedHours', 1);
                      }
                    }}
                    className="w-full"
                  />
                </FormFieldWithLabel>

                {/* Urgency Level */}
                <FormFieldWithLabel
                  label="Urgency Level"
                  className="md:col-span-2"
                >
                  <UrgencySelector
                    value={formData.urgency}
                    onChange={(urgency) => handleInputChange('urgency', urgency)}
                  />
                </FormFieldWithLabel>
              </div>
            </div>
          )}

          {/* Cost Estimate */}
          {selectedTier && formData.tierId && (
            <CostEstimateCard
              totalCost={estimatedCost}
              hours={hours}
              hourlyRate={baseRate}
              tierName={selectedTier.name}
            />
          )}

          {/* Form Actions */}
          {formData.tierId && (
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-slate-700 hover:bg-slate-800 text-white font-semibold py-4 text-lg rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Service Request</span>
                  </>
                )}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="outline"
                  className="px-8 py-4 text-lg rounded-xl"
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};