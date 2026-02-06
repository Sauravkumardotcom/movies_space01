import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../store/auth';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '../components/common/FormElements';
import { Input } from '../components/common/FormElements';
import { Container, VStack, HStack, Card, Spacer } from '../components/layout/LayoutPrimitives';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, isLoading, error, setError } = useAuth();
  const { tokens } = useTheme();

  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [editFormData, setEditFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const errors = { username: '', email: '', password: '', confirmPassword: '' };
    let isValid = true;

    if (!editFormData.username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    } else if (editFormData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    if (!editFormData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }

    setValidationErrors(errors);
    if (!isValid) return;

    try {
      await updateProfile({
        username: editFormData.username,
        email: editFormData.email,
        bio: editFormData.bio,
        avatar: editFormData.avatar,
      });
      setEditMode(false);
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const errors = { username: '', email: '', password: '', confirmPassword: '' };
    let isValid = true;

    if (!passwordData.currentPassword.trim()) {
      errors.password = 'Current password is required';
      isValid = false;
    }

    if (!passwordData.newPassword.trim()) {
      errors.password = 'New password is required';
      isValid = false;
    } else if (passwordData.newPassword.length < 6) {
      errors.password = 'New password must be at least 6 characters';
      isValid = false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setValidationErrors(errors);
    if (!isValid) return;

    try {
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Password change error:', err);
    }
  };

  return (
    <Container size="lg" style={{ paddingTop: tokens.spacing.lg, paddingBottom: tokens.spacing.lg }}>
      <VStack gap="lg">
        {/* Header */}
        <VStack gap="sm">
          <h1 style={{ fontSize: tokens.typography.sizes.lg, fontWeight: 'bold', color: tokens.colors.text.primary }}>
            Account Settings
          </h1>
          <p style={{ color: tokens.colors.text.tertiary, fontSize: tokens.typography.sizes.sm }}>
            Manage your profile and security
          </p>
        </VStack>

        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: tokens.colors.error.surface,
              border: `1px solid ${tokens.colors.error.border}`,
              borderRadius: tokens.radius.md,
              padding: tokens.spacing.md,
              color: tokens.colors.error.text,
              fontSize: tokens.typography.sizes.sm,
            }}
          >
            {error}
          </div>
        )}

        {/* Profile Card */}
        <Card
          style={{
            backgroundColor: tokens.colors.background.secondary,
            borderRadius: tokens.radius.lg,
            padding: tokens.spacing.lg,
            overflow: 'hidden',
          }}
        >
          {/* Profile Header Banner */}
          <div
            style={{
              background: `linear-gradient(to right, ${tokens.colors.primary}, ${tokens.colors.secondary})`,
              height: '120px',
              position: 'relative',
              marginBottom: tokens.spacing.xl,
            }}
          >
            {/* Avatar */}
            <div
              style={{
                position: 'absolute',
                bottom: `-${tokens.spacing.lg}`,
                left: tokens.spacing.lg,
                width: '100px',
                height: '100px',
                borderRadius: tokens.radius.full,
                border: `4px solid ${tokens.colors.background.secondary}`,
                backgroundColor: tokens.colors.background.secondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                fontSize: '36px',
                fontWeight: 'bold',
                color: tokens.colors.text.tertiary,
              }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.username?.[0]?.toUpperCase()
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div style={{ marginTop: tokens.spacing.lg }}>
            {!editMode ? (
              <VStack gap="lg">
                {/* View Mode */}
                <VStack gap="md">
                  <div>
                    <p style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.text.tertiary, marginBottom: tokens.spacing.xs }}>
                      Username
                    </p>
                    <p style={{ fontSize: tokens.typography.sizes.md, color: tokens.colors.text.primary, fontWeight: '600' }}>
                      {user?.username}
                    </p>
                  </div>

                  <div>
                    <p style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.text.tertiary, marginBottom: tokens.spacing.xs }}>
                      Email Address
                    </p>
                    <p style={{ fontSize: tokens.typography.sizes.md, color: tokens.colors.text.primary }}>
                      {user?.email}
                    </p>
                  </div>

                  {user?.bio && (
                    <div>
                      <p style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.text.tertiary, marginBottom: tokens.spacing.xs }}>
                        Bio
                      </p>
                      <p style={{ fontSize: tokens.typography.sizes.md, color: tokens.colors.text.primary }}>
                        {user.bio}
                      </p>
                    </div>
                  )}
                </VStack>

                <HStack gap="md">
                  <Button variant="primary" onClick={() => setEditMode(true)}>
                    Edit Profile
                  </Button>
                  <Button variant="secondary" onClick={() => setShowPasswordModal(true)}>
                    Change Password
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <VStack gap="md">
                  <Input
                    label="Username"
                    type="text"
                    value={editFormData.username}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    error={validationErrors.username}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    error={validationErrors.email}
                  />

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: tokens.typography.sizes.sm,
                        fontWeight: '500',
                        color: tokens.colors.text.secondary,
                        marginBottom: tokens.spacing.xs,
                      }}
                    >
                      Bio
                    </label>
                    <textarea
                      value={editFormData.bio}
                      onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                      rows={3}
                      placeholder="Tell us about yourself..."
                      style={{
                        width: '100%',
                        backgroundColor: tokens.colors.input.background,
                        border: `1px solid ${tokens.colors.input.border}`,
                        color: tokens.colors.input.text,
                        borderRadius: tokens.radius.md,
                        padding: tokens.spacing.md,
                        fontSize: tokens.typography.sizes.sm,
                        fontFamily: 'inherit',
                        resize: 'none',
                        transition: `all ${tokens.transitions.normal}`,
                      }}
                    />
                  </div>

                  <HStack gap="md">
                    <Button type="submit" variant="primary" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditMode(false);
                        setEditFormData({
                          username: user?.username || '',
                          email: user?.email || '',
                          bio: user?.bio || '',
                          avatar: user?.avatar || '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              </form>
            )}
          </div>
        </Card>

        {/* Logout Section */}
        <Card style={{ backgroundColor: tokens.colors.background.secondary, borderRadius: tokens.radius.lg, padding: tokens.spacing.lg }}>
          <VStack gap="md">
            <div>
              <h2 style={{ fontSize: tokens.typography.sizes.md, fontWeight: 'bold', color: tokens.colors.text.primary, marginBottom: tokens.spacing.sm }}>
                Session
              </h2>
              <p style={{ color: tokens.colors.text.tertiary, fontSize: tokens.typography.sizes.sm }}>
                Sign out of your account on all devices
              </p>
            </div>
            <Button
              variant="danger"
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{ width: '100%' }}
            >
              <LogOut size={16} style={{ marginRight: tokens.spacing.xs }} />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </VStack>
        </Card>
      </VStack>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: tokens.spacing.md,
            zIndex: 50,
          }}
        >
          <Card style={{ backgroundColor: tokens.colors.background.secondary, borderRadius: tokens.radius.lg, padding: tokens.spacing.lg, maxWidth: '400px', width: '100%' }}>
            <VStack gap="lg">
              <h2 style={{ fontSize: tokens.typography.sizes.md, fontWeight: 'bold', color: tokens.colors.text.primary }}>
                Change Password
              </h2>

              <form onSubmit={handleChangePassword} style={{ width: '100%' }}>
                <VStack gap="md">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                  />

                  <Input
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    error={validationErrors.password}
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    error={validationErrors.confirmPassword}
                  />

                  <HStack gap="md">
                    <Button type="submit" variant="primary" disabled={isLoading} style={{ flex: 1 }}>
                      {isLoading ? 'Changing...' : 'Change Password'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </VStack>
          </Card>
        </div>
      )}
    </Container>
  );
};

export default ProfilePage;
