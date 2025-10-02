import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input, Select } from './ui';
import { useNotificationService } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';
import { serviceApi, requestApi } from '../services/realApi';
import { ServiceCategoryDto, ServiceTierDto, CreateServiceRequestDto } from '../types/api';

interface ServiceRequestFormData {
  categoryId: number | null;
  tierId: number | null;
  title: string;
  description: string;
  address: string;
  preferredDate: string;
  estimatedHours: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
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
  const estimatedCost = selectedTier ? selectedTier.baseHourlyRate * formData.estimatedHours : 0;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Request a Service</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Category *
          </label>
          <Select
            value={formData.categoryId?.toString() || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full"
          >
            <option value="">Select a service category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon ? `${category.icon} ${category.name}` : category.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Service Tier Selection */}
        {selectedCategory && tiers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Tier *
            </label>
            <Select
              value={formData.tierId?.toString() || ''}
              onChange={(e) => handleTierChange(e.target.value)}
              className="w-full"
            >
              <option value="">Select a service tier</option>
              {tiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} - ${tier.baseHourlyRate}/hour
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Service Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Title *
          </label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Fix leaky faucet"
            className="w-full"
          />
        </div>

        {/* Service Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the service you need..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Address *
          </label>
          <Input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter the address where service is needed"
            className="w-full"
          />
        </div>

        {/* Preferred Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Date
          </label>
          <Input
            type="datetime-local"
            value={formData.preferredDate}
            onChange={(e) => handleInputChange('preferredDate', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Estimated Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Hours *
          </label>
          <Input
            type="number"
            min="1"
            value={formData.estimatedHours.toString()}
            onChange={(e) => handleInputChange('estimatedHours', parseInt(e.target.value) || 1)}
            className="w-full"
          />
        </div>

        {/* Urgency Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Urgency Level
          </label>
          <Select
            value={formData.urgency}
            onChange={(e) => handleInputChange('urgency', e.target.value as 'low' | 'medium' | 'high' | 'emergency')}
            className="w-full"
          >
            <option value="low">Low - Can wait a few days</option>
            <option value="medium">Medium - Within 1-2 days</option>
            <option value="high">High - Same day preferred</option>
            <option value="emergency">Emergency - ASAP</option>
          </Select>
        </div>

        {/* Cost Estimate */}
        {selectedTier && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Cost Estimate</h3>
            <p className="text-blue-800">
              <span className="font-semibold">${estimatedCost.toFixed(2)}</span> 
              {' '}({formData.estimatedHours} hours × ${selectedTier.baseHourlyRate}/hour)
            </p>
            <p className="text-sm text-blue-600 mt-1">
              * Final cost may vary based on actual work required
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};