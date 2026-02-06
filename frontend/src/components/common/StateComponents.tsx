import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { Flex, VStack } from '../layout/LayoutPrimitives';

export const Skeleton: React.FC<{ width?: string; height?: string; className?: string }> = ({
  width = 'w-full',
  height = 'h-4',
  className = '',
}) => {
  const { tokens } = useTheme();
  return (
    <div
      style={{
        backgroundColor: tokens.colors.surfaceSecondary,
      }}
      className={`${width} ${height} rounded animate-pulse ${className}`}
    />
  );
};

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`${sizes[size]} border-4 border-transparent border-t-blue-500 rounded-full animate-spin`} />
  );
};

export const LoadingScreen: React.FC = () => {
  const { tokens } = useTheme();

  return (
    <Flex align="center" justify="center" className="min-h-screen">
      <VStack align="center" gap="md">
        <LoadingSpinner size="lg" />
        <p style={{ color: tokens.colors.textMuted }}>Loading...</p>
      </VStack>
    </Flex>
  );
};

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  const { tokens } = useTheme();

  return (
    <Flex
      direction="col"
      align="center"
      justify="center"
      className="min-h-96 py-12 px-4"
    >
      <VStack align="center" gap="md">
        <div className="text-6xl">{icon}</div>
        <h3 style={{ color: tokens.colors.text }} className="text-xl font-semibold">
          {title}
        </h3>
        {description && (
          <p style={{ color: tokens.colors.textMuted }} className="text-center max-w-md">
            {description}
          </p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            style={{
              backgroundColor: tokens.colors.primary,
              color: 'white',
            }}
            className="px-6 py-2 rounded-lg font-semibold hover:shadow-md transition-all mt-4"
          >
            {action.label}
          </button>
        )}
      </VStack>
    </Flex>
  );
};

interface ErrorStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  action,
}) => {
  const { tokens } = useTheme();

  return (
    <Flex
      direction="col"
      align="center"
      justify="center"
      className="min-h-96 py-12 px-4"
    >
      <VStack align="center" gap="md">
        <div className="text-6xl">❌</div>
        <h3 style={{ color: tokens.colors.error }} className="text-xl font-semibold">
          {title}
        </h3>
        {description && (
          <p style={{ color: tokens.colors.textMuted }} className="text-center max-w-md">
            {description}
          </p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            style={{
              backgroundColor: tokens.colors.error,
              color: 'white',
            }}
            className="px-6 py-2 rounded-lg font-semibold hover:shadow-md transition-all mt-4"
          >
            {action.label}
          </button>
        )}
      </VStack>
    </Flex>
  );
};

interface SkeletonCardProps {
  count?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg">
          <Skeleton height="h-48" className="mb-4" />
          <Skeleton height="h-4" className="mb-2" />
          <Skeleton height="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
};
