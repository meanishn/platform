import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input } from './ui';
import { useNotificationService } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';
import { serviceApi, requestApi } from '../services/realApi';
import { ServiceCategoryDto, ServiceTierDto, CreateServiceRequestDto } from '../types/api';
import { Calendar, Clock, Flame, AlertTriangle, CheckCircle2, DollarSign, Info, Send } from 'lucide-react';

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

// Urgency configuration
const urgencyConfig = {
  low: { 
    label: 'Low Priority', 
    icon: Calendar, 
    color: 'text-emerald-700', 
    bgColor: 'bg-emerald-50', 
    borderColor: 'border-emerald-200',
    description: 'Can wait a few days'
  },
  medium: { 
    label: 'Medium Priority', 
    icon: Clock, 
    color: 'text-amber-700', 
    bgColor: 'bg-amber-50', 
    borderColor: 'border-amber-200',
    description: 'Within 1-2 days'
  },
  high: { 
    label: 'High Priority', 
    icon: Flame, 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    description: 'Same day preferred'
  },
  emergency: { 
    label: 'Emergency', 
    icon: AlertTriangle, 
    color: 'text-red-700', 
    bgColor: 'bg-red-100', 
    borderColor: 'border-red-300',
    description: 'Immediate attention required'
  }
};

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
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded-lg mb-6"></div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="h-32 bg-slate-200 rounded-xl"></div>
              <div className="h-32 bg-slate-200 rounded-xl"></div>
              <div className="h-32 bg-slate-200 rounded-xl"></div>
            </div>
            <div className="space-y-4">
              <div className="h-12 bg-slate-200 rounded-lg"></div>
              <div className="h-12 bg-slate-200 rounded-lg"></div>
              <div className="h-24 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
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
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-slate-700 text-white rounded-full font-bold text-sm">1</div>
              <h3 className="text-xl font-semibold text-slate-900">Choose Service Category</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const isSelected = formData.categoryId === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryChange(category.id.toString())}
                    className={`
                      relative p-6 rounded-xl border-2 transition-all text-left
                      hover:shadow-lg
                      ${isSelected 
                        ? 'border-slate-700 bg-slate-50 shadow-md' 
                        : 'border-slate-200 bg-white hover:border-slate-400'
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div className="text-4xl mb-3">{category.icon || '🔧'}</div>
                    <h4 className="font-semibold text-lg text-slate-900 mb-1">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">{category.description}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Service Tier Selection */}
          {selectedCategory && tiers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-700 text-white rounded-full font-bold text-sm">2</div>
                <h3 className="text-xl font-semibold text-slate-900">Select Service Tier</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tiers.map((tier, index) => {
                  const isSelected = formData.tierId === tier.id;
                  const tierColors = [
                    { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'border-l-emerald-400', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: 'text-emerald-600' },
                    { bg: 'bg-slate-50', border: 'border-slate-200', accent: 'border-l-slate-400', badge: 'bg-slate-100 text-slate-800 border-slate-200', icon: 'text-slate-600' },
                    { bg: 'bg-amber-50', border: 'border-amber-200', accent: 'border-l-amber-400', badge: 'bg-amber-100 text-amber-800 border-amber-200', icon: 'text-amber-600' }
                  ];
                  const colors = tierColors[index % 3];
                  
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => handleTierChange(tier.id.toString())}
                      className={`
                        relative p-6 rounded-xl border-2 transition-all text-left overflow-hidden
                        hover:shadow-lg border-l-4 flex flex-col h-full
                        ${isSelected 
                          ? `border-slate-700 ${colors.bg} shadow-lg ${colors.accent}` 
                          : `${colors.border} bg-white hover:border-slate-400 ${colors.accent}`
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center shadow-md">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex-1 flex flex-col">
                        <div className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border mb-3 self-start ${colors.badge}`}>
                          {tier.name}
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-3xl font-bold text-slate-900">
                            ${tier.baseHourlyRate}
                            <span className="text-lg text-slate-600 font-normal">/hour</span>
                          </div>
                        </div>
                        
                        {tier.description && (
                          <p className="text-sm text-slate-600 mb-4">{tier.description}</p>
                        )}
                        
                        {/* Features based on tier */}
                        <div className="space-y-2 text-sm text-slate-700 flex-1">
                          {index === 0 && (
                            <>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className={`w-4 h-4 ${colors.icon}`} />
                                <span>Standard service</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className={`w-4 h-4 ${colors.icon}`} />
                                <span>Basic tools & equipment</span>
                              </div>
                            </>
                          )}
                          {index === 1 && (
                            <>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className={`w-4 h-4 ${colors.icon}`} />
                                <span>Experienced professionals</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className={`w-4 h-4 ${colors.icon}`} />
                                <span>Advanced tools</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className={`w-4 h-4 ${colors.icon}`} />
                                <span>Faster service</span>
                              </div>
                            </>
                          )}
                          {index === 2 && (
                            <>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className={`w-4 h-4 ${colors.icon}`} />
                                <span>Top-tier experts</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className={`w-4 h-4 ${colors.icon}`} />
                                <span>Premium equipment</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className={`w-4 h-4 ${colors.icon}`} />
                                <span>Priority service</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className={`w-4 h-4 ${colors.icon}`} />
                                <span>Extended warranty</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Service Details */}
          {formData.tierId && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-slate-700 text-white rounded-full font-bold text-sm">3</div>
                <h3 className="text-xl font-semibold text-slate-900">Service Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Service Title <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Fix leaking kitchen faucet"
                    className="w-full text-lg"
                  />
                </div>

                {/* Service Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the service you need in detail..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all text-slate-900 placeholder-slate-400 bg-white"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Service Address <span className="text-red-600">*</span>
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preferred Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.preferredDate}
                    onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-1">When would you like the service to be done?</p>
                </div>

                {/* Estimated Hours */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Estimated Hours <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.estimatedHours.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string and any number while typing
                      if (value === '' || value === '0') {
                        // Store 0 temporarily to allow user to type
                        handleInputChange('estimatedHours', 0);
                      } else {
                        const parsed = parseFloat(value);
                        handleInputChange('estimatedHours', isNaN(parsed) ? 0 : parsed);
                      }
                    }}
                    onBlur={(e) => {
                      // Enforce minimum value of 1 when user leaves the field
                      const value = parseFloat(e.target.value);
                      if (isNaN(value) || value < 1) {
                        handleInputChange('estimatedHours', 1);
                      }
                    }}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">How many hours do you think this will take?</p>
                </div>

                {/* Urgency Level */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Urgency Level
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(Object.keys(urgencyConfig) as Array<keyof typeof urgencyConfig>).map((urgencyKey) => {
                      const config = urgencyConfig[urgencyKey];
                      const isSelected = formData.urgency === urgencyKey;
                      const IconComponent = config.icon;
                      
                      return (
                        <button
                          key={urgencyKey}
                          type="button"
                          onClick={() => handleInputChange('urgency', urgencyKey)}
                          className={`
                            p-4 rounded-xl border-2 transition-all text-center
                            hover:shadow-md
                            ${isSelected 
                              ? `${config.borderColor} ${config.bgColor} shadow-md` 
                              : 'border-slate-200 bg-white hover:border-slate-300'
                            }
                          `}
                        >
                          <div className="flex justify-center mb-2">
                            <IconComponent className={`w-8 h-8 ${isSelected ? config.color : 'text-slate-400'}`} />
                          </div>
                          <div className={`font-semibold text-sm mb-1 ${isSelected ? config.color : 'text-slate-700'}`}>
                            {config.label}
                          </div>
                          <div className="text-xs text-slate-500">{config.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cost Estimate */}
          {selectedTier && formData.tierId && (
            <div className="bg-slate-50 p-6 rounded-xl border-2 border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-2 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-slate-600" />
                    Cost Estimate
                  </h3>
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    ${estimatedCost.toFixed(2)}
                  </div>
                  <p className="text-slate-700">
                    {hours.toFixed(1)} hours × ${baseRate.toFixed(2)}/hour
                  </p>
                  <p className="text-sm text-slate-600 mt-3 flex items-center gap-1">
                    <Info className="w-4 h-4" />
                    <span>Final cost may vary based on actual work required</span>
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Selected Tier</div>
                  <div className="font-semibold text-slate-700">{selectedTier?.name || 'N/A'}</div>
                </div>
              </div>
            </div>
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