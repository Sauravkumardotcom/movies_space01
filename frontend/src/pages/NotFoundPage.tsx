import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeProvider';
import { Container, VStack, Flex } from '../components/layout/LayoutPrimitives';
import { Button } from '../components/common/FormElements';

export function NotFoundPage(): JSX.Element {
  const navigate = useNavigate();
  const { tokens } = useTheme();

  return (
    <div
      style={{ backgroundColor: tokens.colors.background, color: tokens.colors.text }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <Container maxWidth="md">
        <VStack align="center" justify="center" gap="lg">
          {/* 404 Icon */}
          <div className="text-9xl font-bold" style={{ color: tokens.colors.primary }}>
            404
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: 'bold' }} className="text-center">
            Page Not Found
          </h1>

          {/* Description */}
          <p
            style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.md }}
            className="text-center"
          >
            The page you're looking for doesn't exist. It might have been moved or removed.
          </p>

          {/* Action Buttons */}
          <Flex direction="row" gap="md" wrap className="justify-center w-full pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </Flex>

          {/* Decorative Element */}
          <div className="mt-8 text-6xl">
            🎬
          </div>
        </VStack>
      </Container>
    </div>
  );
}
