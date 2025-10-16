/**
 * Dashboard Page
 * 
 * General dashboard with stats and recent activity.
 * REFACTORED: Following design system and refactor guidelines.
 * Fully responsive with mobile-first design.
 */

import { StatCard, PageHeader, Card, EmptyState, SectionHeader, PageContainer } from '../components/ui';
import { ClipboardList, CheckCircle2, DollarSign, TrendingUp } from 'lucide-react';
import { responsiveGrids, responsiveSpacing } from '../styles/responsive.config';

export const Dashboard = () => {
  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your activity."
      />
      
      <div className={responsiveGrids.stats3}>
        <StatCard
          icon={ClipboardList}
          label="Active Requests"
          value={0}
          colorScheme="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Jobs"
          value={0}
          colorScheme="green"
        />
        <StatCard
          icon={DollarSign}
          label="Total Spent"
          value="$0"
          colorScheme="yellow"
        />
      </div>

      {/* Recent Activity Section */}
      <Card>
        <div className={responsiveSpacing.cardPadding}>
          <SectionHeader 
            title="Recent Activity" 
            icon={TrendingUp}
            iconVariant="info"
          />
          <EmptyState
            icon={TrendingUp}
            title="No recent activity to display"
            description="Your recent requests and activities will appear here"
          />
        </div>
      </Card>
    </PageContainer>
  );
};
