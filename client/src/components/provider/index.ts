/**
 * Provider-specific components
 */

// Provider-specific components (only for provider users)
export { MatchBadge } from './MatchBadge';
export { JobDetailsModal } from './JobDetailsModal';
export { ProfileStatusCard } from './ProfileStatusCard';
export { CustomerInfoHeader } from './CustomerInfoHeader';

// Re-export shared UI components for convenience
// These components are now imported from ui/ to avoid duplication
export {
  StatCard,
  InfoBanner,
  EmptyState,
  JobDetailItem,
  UrgencyBadge,
  StatusBadge,
  PageHeader,
  LoadingSkeleton,
  CenteredLoadingSpinner,
} from '../ui';

export type { ProfileStatusCardProps, ProfileStatus } from './ProfileStatusCard';
export type { CustomerInfoHeaderProps } from './CustomerInfoHeader';
