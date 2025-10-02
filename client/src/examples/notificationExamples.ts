// Example usage of notification system in components

import { useNotificationService } from '../services/notificationService';
import { requestApi } from '../services/realApi';
import { CreateServiceRequestDto } from '../types/api';

// In a service request component
export const ServiceRequestExample = () => {
  const notify = useNotificationService();

  const handleRequestSubmit = async (requestData: CreateServiceRequestDto) => {
    try {
      const response = await requestApi.createRequest(requestData);

      if (response.success) {
        // Success notification with action
        notify.serviceRequest(
          'Request Submitted', 
          'Your service request has been submitted successfully!',
          {
            actionUrl: '/requests',
            actionText: 'View Request'
          }
        );
      }
    } catch (error) {
      console.error('Request submission error:', error);
      // Error notification
      notify.error(
        'Submission Failed',
        'Failed to submit your request. Please try again.',
        { persistent: true }
      );
    }
  };

  const handlePaymentSuccess = () => {
    notify.payment(
      'Payment Processed',
      'Your payment of $150 has been processed successfully.',
      { type: 'success' }
    );
  };

  const handleProviderAccepted = () => {
    notify.providerUpdate(
      'Provider Accepted',
      'John Doe has accepted your plumbing request.',
      { 
        type: 'success',
        actionUrl: '/requests/123',
        actionText: 'View Details'
      }
    );
  };

  const handleSystemMaintenance = () => {
    notify.warning(
      'Scheduled Maintenance',
      'System will be down for maintenance from 2-4 AM EST.',
      { persistent: true }
    );
  };

  const handlePromotion = () => {
    notify.promotion(
      'Special Offer!',
      'Get 20% off your next service request. Code: SAVE20',
      { duration: 10000 }
    );
  };

  return null; // Example component
};

// Usage patterns for different scenarios:

// 1. Form submission success
// notify.success('Profile Updated', 'Your profile changes have been saved.');

// 2. API error with retry option
// notify.error('Connection Failed', 'Unable to connect to server.', { 
//   persistent: true,
//   actionText: 'Retry',
//   actionUrl: window.location.href
// });

// 3. Service-specific notifications
// notify.serviceRequest('New Message', 'You have a new message from your provider.');

// 4. Payment notifications
// notify.payment('Payment Due', 'Your payment for service #123 is due tomorrow.');

// 5. System notifications
// notify.info('Feature Update', 'New messaging feature is now available!');

// 6. Real-time updates
// WebSocket or EventSource integration:
// socket.on('notification', (data) => {
//   notify.notify({
//     title: data.title,
//     message: data.message,
//     type: data.type,
//     category: data.category,
//     showToast: true
//   });
// });
