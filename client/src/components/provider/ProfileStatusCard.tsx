/**
 * ProfileStatusCard Component
 * 
 * Extracted from Provider Dashboard to encapsulate profile status display.
 * Shows provider profile completion and verification status.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../ui';

export interface ProfileStatus {
  completionPercentage: number;
  verificationStatus: 'verified' | 'pending' | 'unverified';
}

export interface ProfileStatusCardProps {
  status: ProfileStatus;
  editProfileHref: string;
}

export const ProfileStatusCard: React.FC<ProfileStatusCardProps> = ({
  status,
  editProfileHref,
}) => {
  const getVerificationBadge = () => {
    switch (status.verificationStatus) {
      case 'verified':
        return <Badge variant="success" size="sm">Verified</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'unverified':
        return <Badge variant="danger" size="sm">Unverified</Badge>;
      default:
        return <Badge variant="default" size="sm">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Profile Status
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Profile Complete</span>
            <Badge variant="success" size="sm">{status.completionPercentage}%</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Verification</span>
            {getVerificationBadge()}
          </div>
          <div className="mt-4">
            <Link to={editProfileHref}>
              <Button variant="outline" size="sm" className="w-full">
                Complete Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

