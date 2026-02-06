import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '../components/common/FormElements';
import { Input } from '../components/common/FormElements';
import { Container, VStack, Spacer } from '../components/layout/LayoutPrimitives';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, setError } = useAuth();
  const { theme, tokens } = useTheme();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
  });

  const validateForm = (): boolean => {
    const errors = { email: '', password: '' };
    let isValid = true;

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

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
              Welcome Back
            </h1>
            <p style={{ color: tokens.colors.text.tertiary, fontSize: tokens.typography.sizes.sm }}>
              Sign in to continue to Movies Space
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
                label="Password"
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={validationErrors.password}
              />

              {/* Remember Me & Forgot Password */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: tokens.typography.sizes.sm,
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{
                      marginRight: tokens.spacing.xs,
                      accentColor: tokens.colors.primary,
                    }}
                  />
                  <span style={{ color: tokens.colors.text.secondary }}>Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  style={{
                    color: tokens.colors.primary,
                    textDecoration: 'none',
                    transition: `color ${tokens.transitions.normal}`,
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.color = tokens.colors.primary;
                    (e.target as HTMLElement).style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.color = tokens.colors.primary;
                    (e.target as HTMLElement).style.opacity = '1';
                  }}
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                variant="primary"
                size="md"
                style={{ width: '100%' }}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </VStack>
          </form>

          {/* Footer */}
          <p style={{ color: tokens.colors.text.tertiary, fontSize: tokens.typography.sizes.sm }}>
            Don't have an account?{' '}
            <Link
              to="/signup"
              style={{
                color: tokens.colors.primary,
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Sign up
            </Link>
          </p>
        </VStack>
      </Container>
    </div>
  );
};

export default LoginPage;
