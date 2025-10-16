/**
 * PageContainer Component
 * 
 * Provides consistent content wrapper with max-width and spacing.
 * Used within Layout's scrollable main area.
 * Fully responsive with mobile-first design.
 * 
 * Usage:
 * <PageContainer>
 *   <PageHeader... />
 *   {content}
 * </PageContainer>
 */

import React from 'react';
import { maxWidths, responsiveSpacing } from '../../styles/responsive.config';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '7xl' | 'full';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  maxWidth = '7xl',
}) => {
  return (
    <div className={`${maxWidths[maxWidth]} mx-auto ${responsiveSpacing.sectionY} ${className}`}>
      {children}
    </div>
  );
};

