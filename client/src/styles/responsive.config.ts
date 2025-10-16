/**
 * Responsive Design System Configuration
 * 
 * Centralized configuration for breakpoints, spacing, and typography
 * that makes it easy to adjust responsive behavior across all components.
 * 
 * Breakpoints match Tailwind CSS defaults:
 * - xs: 0-639px (mobile phones)
 * - sm: 640px-767px (large phones, small tablets)
 * - md: 768px-1023px (tablets)
 * - lg: 1024px-1279px (small laptops)
 * - xl: 1280px+ (desktops)
 */

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Responsive Spacing Scale
 * Format: [mobile, tablet, desktop]
 */
export const responsiveSpacing = {
  // Page padding
  pageX: 'px-3 sm:px-4 md:px-6',
  pageY: 'py-3 sm:py-4 md:py-6',
  page: 'p-3 sm:p-4 md:p-6',
  
  // Section spacing
  sectionY: 'space-y-3 sm:space-y-4 md:space-y-6',
  sectionGap: 'gap-3 sm:gap-4 md:gap-6',
  
  // Card padding
  cardPadding: 'p-3 sm:p-4 md:p-5',
  cardPaddingX: 'px-3 sm:px-4 md:px-5',
  cardPaddingY: 'py-3 sm:py-4 md:py-5',
  
  // Component spacing
  componentGap: 'gap-2 sm:gap-3 md:gap-4',
  smallGap: 'gap-1.5 sm:gap-2',
  tinyGap: 'gap-1',
} as const;

/**
 * Responsive Typography
 */
export const responsiveTypography = {
  // Page titles
  pageTitle: 'text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-tight',
  
  // Section headings
  sectionHeading: 'text-lg sm:text-xl font-bold text-slate-900 leading-tight',
  
  // Subsection headings
  subsectionHeading: 'text-base sm:text-lg font-semibold text-slate-900 leading-snug',
  
  // Card titles
  cardTitle: 'text-base sm:text-lg font-bold text-slate-900 leading-tight',
  
  // Body text
  bodyPrimary: 'text-xs sm:text-sm text-slate-700 leading-relaxed',
  bodySecondary: 'text-xs sm:text-sm text-slate-600 leading-normal',
  
  // Small text
  small: 'text-[10px] sm:text-xs text-slate-600 leading-normal',
  
  // Labels
  label: 'text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wide',
  
  // Stat values
  statValue: 'text-xl sm:text-2xl md:text-3xl font-bold',
  statLabel: 'text-xs sm:text-sm text-slate-600',
  
  // Button text
  buttonText: 'text-xs sm:text-sm font-medium',
} as const;

/**
 * Grid Layouts
 */
export const responsiveGrids = {
  // Stat cards (1 on xs, 2 on sm, 2-4 on md+)
  stats2: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
  stats3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3',
  stats4: 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3',
  
  // Admin stats (7 columns on desktop)
  adminStats: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3',
  
  // Form fields
  form1: 'grid grid-cols-1 gap-3',
  form2: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
  form3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3',
  
  // Content grids
  content2: 'grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6',
  content3: 'grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6',
  
  // Card lists
  cardList: 'space-y-3 sm:space-y-4',
} as const;

/**
 * Component Sizes
 */
export const responsiveSizes = {
  // Icon containers
  iconSmall: 'w-7 h-7 sm:w-8 sm:h-8',
  iconMedium: 'w-9 h-9 sm:w-10 sm:h-10',
  iconLarge: 'w-10 h-10 sm:w-11 sm:h-11',
  
  // Icons themselves
  iconSizeSmall: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
  iconSizeMedium: 'w-4 h-4 sm:w-5 sm:h-5',
  iconSizeLarge: 'w-5 h-5 sm:w-6 sm:h-6',
  
  // Buttons
  buttonPaddingSm: 'px-2.5 py-1.5 sm:px-3 sm:py-1.5',
  buttonPaddingMd: 'px-3 py-1.5 sm:px-4 sm:py-2',
  buttonPaddingLg: 'px-4 py-2 sm:px-5 sm:py-2.5',
  
  // Avatar/profile images
  avatarSmall: 'w-8 h-8 sm:w-9 sm:h-9',
  avatarMedium: 'w-10 h-10 sm:w-12 sm:h-12',
  avatarLarge: 'w-12 h-12 sm:w-16 sm:h-16',
} as const;

/**
 * Sidebar Configuration
 */
export const sidebarConfig = {
  // When to show sidebar (desktop)
  showAt: 'lg',
  
  // Desktop width
  desktopWidth: 'w-64',
  
  // Mobile behavior
  mobileOverlay: 'fixed inset-0 bg-slate-900/50 z-40',
  mobileSidebar: 'fixed inset-y-0 left-0 z-50 w-64 bg-white',
  
  // Breakpoint classes
  hideOnMobile: 'hidden lg:block',
  showOnMobile: 'block lg:hidden',
} as const;

/**
 * Header Configuration
 */
export const headerConfig = {
  // Height
  height: 'h-14 sm:h-16',
  
  // Navigation visibility
  navShowAt: 'md',
  navHide: 'hidden md:flex',
  
  // Logo sizing
  logoSize: 'w-8 h-8 sm:w-10 sm:h-10',
  logoText: 'text-lg sm:text-xl md:text-2xl',
  
  // User menu
  avatarSize: 'w-7 h-7 sm:w-9 sm:h-9',
  userName: 'hidden sm:inline-block',
} as const;

/**
 * Max Width Containers
 */
export const maxWidths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
} as const;

/**
 * Helper function to get responsive class string
 */
export const getResponsiveClasses = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Common patterns for quick use
 */
export const commonPatterns = {
  // Flex patterns
  flexRow: 'flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3',
  flexRowReverse: 'flex flex-col-reverse sm:flex-row items-start sm:items-center gap-2 sm:gap-3',
  flexBetween: 'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4',
  flexCenter: 'flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3',
  
  // Button groups
  buttonGroup: 'flex flex-wrap items-center gap-2',
  buttonGroupVertical: 'flex flex-col sm:flex-row gap-2',
  
  // Card header
  cardHeader: 'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 sm:mb-4 pb-3 border-b border-slate-200/60',
  
  // Card footer
  cardFooter: 'flex flex-wrap gap-2 pt-3 border-t border-slate-200/60',
  
  // Badge group
  badgeGroup: 'flex flex-wrap items-center gap-1.5 sm:gap-2',
} as const;

export default {
  breakpoints,
  responsiveSpacing,
  responsiveTypography,
  responsiveGrids,
  responsiveSizes,
  sidebarConfig,
  headerConfig,
  maxWidths,
  getResponsiveClasses,
  commonPatterns,
};

