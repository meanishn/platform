/**
 * useJobDetailsModal Hook
 * 
 * Provides a reusable way to open job details modal from anywhere in the app
 * Usage:
 * 
 * const { openJobDetails, JobDetailsModalComponent } = useJobDetailsModal();
 * 
 * // In your component JSX:
 * <Button onClick={() => openJobDetails(jobId)}>View Details</Button>
 * {JobDetailsModalComponent}
 * 
 * // Or with callback:
 * <Button onClick={() => openJobDetails(jobId, () => refreshData())}>View Details</Button>
 */

import { useState, useCallback, useRef } from 'react';
import { JobDetailsModal } from '../components/provider';

export const useJobDetailsModal = () => {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  // Use ref to avoid triggering re-renders when callback changes
  const onActionCallbackRef = useRef<(() => void) | undefined>(undefined);

  const openJobDetails = useCallback((jobId: number, onActionComplete?: () => void) => {
    setSelectedJobId(jobId);
    onActionCallbackRef.current = onActionComplete;
  }, []);

  const closeJobDetails = useCallback(() => {
    setSelectedJobId(null);
    onActionCallbackRef.current = undefined;
  }, []);

  const handleActionComplete = useCallback(() => {
    const callback = onActionCallbackRef.current;
    closeJobDetails();
    if (callback) {
      callback();
    }
  }, [closeJobDetails]);

  const JobDetailsModalComponent = selectedJobId ? (
    <JobDetailsModal
      jobId={selectedJobId}
      isOpen={true}
      onClose={closeJobDetails}
      onActionComplete={handleActionComplete}
    />
  ) : null;

  return {
    openJobDetails,
    closeJobDetails,
    JobDetailsModalComponent,
    isOpen: selectedJobId !== null,
    selectedJobId
  };
};
