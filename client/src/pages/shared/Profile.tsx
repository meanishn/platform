/**
 * Profile Page
 * 
 * User profile settings with tabs for personal info, contact, preferences, and security.
 * REFACTORED: Following design system and refactor guidelines.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Card, 
  Button, 
  Input, 
  Textarea, 
  TabNavigation, 
  ToggleSwitch, 
  SecuritySettingCard, 
  LoadingSkeleton,
  PageContainer,
} from '../../components/ui';
import { userApi } from '../../services/realApi';
import { AuthUserDto } from '../../types/api';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<AuthUserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (user) {
      setProfile(user);
      setIsLoading(false);
    } else {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const result = await userApi.getProfile();
      if (result.success && result.data) {
        setProfile(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        address: profile.address,
        latitude: profile.latitude,
        longitude: profile.longitude,
        profileImage: profile.profileImage,
      };

      const result = await userApi.updateProfile(updateData);
      if (result.success && result.data) {
        updateUser(result.data);
        // Show success message
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (field: string, value: any) => {
    setProfile(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value } as AuthUserDto;
    });
  };

  const handleAddressChange = (field: string, value: string) => {
    setProfile(prev => {
      if (!prev || typeof prev.address !== 'object') return prev;
      return {
        ...prev,
        address: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(prev.address as any),
          [field]: value
        }
      } as AuthUserDto;
    });
  };

  const handlePreferenceChange = (field: string, value: boolean) => {
    setProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        preferences: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(prev as any).preferences,
          [field]: value
        }
      } as AuthUserDto;
    });
  };

  if (isLoading || !profile) {
    return (
      <div className="p-6">
        <LoadingSkeleton type="page" count={1} />
      </div>
    );
  }

  return (
    <PageContainer maxWidth="7xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">Profile Settings</h1>
          <p className="text-sm text-slate-600 leading-normal mt-1">Manage your account information and preferences</p>
        </div>

        {/* Tab Navigation */}
        <TabNavigation
          tabs={[
            { id: 'personal', label: 'Personal Information' },
            { id: 'contact', label: 'Contact & Address' },
            { id: 'preferences', label: 'Preferences' },
            { id: 'security', label: 'Security' }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <Card>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-slate-900 leading-snug mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  First Name
                </label>
                <Input
                  value={profile?.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Last Name
                </label>
                <Input
                  value={profile?.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={profile?.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bio
              </label>
              <Textarea
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value={(profile as any).bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
          </Card>
        )}

        {/* Contact & Address Tab */}
        {activeTab === 'contact' && (
          <Card>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-slate-900 leading-snug mb-6">Contact & Address</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <h4 className="text-md font-medium text-slate-900 mb-4">Address</h4>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={(profile.address as any)?.street || ''}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="Street Address"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      value={(profile.address as any)?.city || ''}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="City"
                    />
                    <Input
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      value={(profile.address as any)?.state || ''}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      placeholder="State"
                    />
                    <Input
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      value={(profile.address as any)?.zipCode || ''}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          </Card>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <Card>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-slate-900 leading-snug mb-6">Notification Preferences</h3>
            
            <div className="space-y-6">
              <ToggleSwitch
                label="Email Notifications"
                description="Receive updates about your service requests"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                checked={(profile as any).preferences?.emailNotifications || false}
                onChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
              />
              <ToggleSwitch
                label="SMS Notifications"
                description="Receive text messages for urgent updates"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                checked={(profile as any).preferences?.smsNotifications || false}
                onChange={(checked) => handlePreferenceChange('smsNotifications', checked)}
              />
              <ToggleSwitch
                label="Marketing Emails"
                description="Receive promotional offers and news"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                checked={(profile as any).preferences?.marketingEmails || false}
                onChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
              />
            </div>
          </div>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <Card>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-slate-900 leading-snug mb-6">Security Settings</h3>
            
            <div className="space-y-6">
              <SecuritySettingCard
                title="Password"
                description="Last changed 3 months ago"
                actionLabel="Change Password"
                onAction={() => console.log('Change password')}
              />
              <SecuritySettingCard
                title="Two-Factor Authentication"
                description="Add an extra layer of security to your account"
                actionLabel="Enable 2FA"
                onAction={() => console.log('Enable 2FA')}
              />
              <SecuritySettingCard
                title="Active Sessions"
                description="Manage your active login sessions"
                actionLabel="View Sessions"
                onAction={() => console.log('View sessions')}
              />
            </div>
          </div>
          </Card>
        )}

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-32"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
    </PageContainer>
  );
};
