/**
 * Provider-specific components
 */

// Provider-specific components (only for provider users)
export { MatchBadge, CompactMatchBadge } from './MatchBadge';
export { JobDetailsModal } from './JobDetailsModal';
export { JobCard } from './JobCard';
export { ProfileStatusCard } from './ProfileStatusCard';

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

export type { JobCardProps } from './JobCard';
export type { ProfileStatusCardProps, ProfileStatus } from './ProfileStatusCard';
