import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '../components/common/FormElements';
import { Input } from '../components/common/FormElements';
import { Container, VStack, Spacer } from '../components/layout/LayoutPrimitives';

// Password strength indicator
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair', color: '#eab308' };
  if (score <= 3) return { score, label: 'Good', color: '#3b82f6' };
  return { score, label: 'Strong', color: '#22c55e' };
};

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error, setError } = useAuth();
  const { tokens } = useTheme();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateForm = (): boolean => {
    const errors = { email: '', username: '', password: '', confirmPassword: '' };
    let isValid = true;

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
      isValid = false;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, underscore, and dash';
      isValid = false;
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!agreedToTerms) {
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    try {
      await signup(formData.email, formData.username, formData.password);
      navigate('/');
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div
      style={{
        backgroundColor: tokens.colors.background.primary,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: tokens.spacing.md,
      }}
    >
      <Container size="sm">
        <VStack gap="xl" align="center">
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                fontSize: tokens.typography.sizes.xl,
                fontWeight: 'bold',
                color: tokens.colors.text.primary,
                marginBottom: tokens.spacing.sm,
              }}
            >
              Join Movies Space
            </h1>
            <p style={{ color: tokens.colors.text.tertiary, fontSize: tokens.typography.sizes.sm }}>
              Create your account to get started
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: `${tokens.colors.error.surface}`,
                border: `1px solid ${tokens.colors.error.border}`,
                borderRadius: tokens.radius.md,
                padding: tokens.spacing.md,
                color: tokens.colors.error.text,
                fontSize: tokens.typography.sizes.sm,
                width: '100%',
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack gap="md">
              <Input
                label="Email Address"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={validationErrors.email}
              />

              <Input
                label="Username"
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="your_username"
                error={validationErrors.username}
              />

              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    fontSize: tokens.typography.sizes.sm,
                    fontWeight: '500',
                    color: tokens.colors.text.secondary,
                    marginBottom: tokens.spacing.xs,
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    backgroundColor: tokens.colors.input.background,
                    border: `1px solid ${tokens.colors.input.border}`,
                    color: tokens.colors.input.text,
                    borderRadius: tokens.radius.md,
                    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                    fontSize: tokens.typography.sizes.sm,
                    transition: `all ${tokens.transitions.normal}`,
                  }}
                />
                {validationErrors.password && (
                  <p style={{ color: tokens.colors.error.text, fontSize: tokens.typography.sizes.xs, marginTop: tokens.spacing.xs }}>
                    {validationErrors.password}
                  </p>
                )}

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div style={{ marginTop: tokens.spacing.sm, display: 'flex', flexDirection: 'column', gap: tokens.spacing.xs }}>
                    <div style={{ display: 'flex', gap: tokens.spacing.sm, alignItems: 'center' }}>
                      <div
                        style={{
                          flex: 1,
                          height: '4px',
                          backgroundColor: tokens.colors.background.secondary,
                          borderRadius: tokens.radius.full,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${(passwordStrength.score / 5) * 100}%`,
                            backgroundColor: passwordStrength.color,
                            transition: `width ${tokens.transitions.normal}`,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: tokens.typography.sizes.xs,
                          fontWeight: '600',
                          color: passwordStrength.color,
                        }}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <p style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.text.tertiary }}>
                      Use uppercase, lowercase, numbers, and symbols for a stronger password
                    </p>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={validationErrors.confirmPassword}
              />

              {/* Terms Agreement */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: tokens.spacing.sm,
                  fontSize: tokens.typography.sizes.sm,
                  color: tokens.colors.text.secondary,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{
                    marginTop: '4px',
                    accentColor: tokens.colors.primary,
                  }}
                />
                <span>
                  I agree to the{' '}
                  <a
                    href="/terms"
                    style={{
                      color: tokens.colors.primary,
                      textDecoration: 'none',
                    }}
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="/privacy"
                    style={{
                      color: tokens.colors.primary,
                      textDecoration: 'none',
                    }}
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>

              <Button
                type="submit"
                disabled={isLoading || !agreedToTerms}
                variant="primary"
                size="md"
                style={{ width: '100%' }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </VStack>
          </form>

          {/* Footer */}
          <p style={{ color: tokens.colors.text.tertiary, fontSize: tokens.typography.sizes.sm }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: tokens.colors.primary,
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Sign in
            </Link>
          </p>
        </VStack>
      </Container>
    </div>
  );
};

export default SignupPage;
