import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { useHistory } from '../hooks/useEngagement';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '../components/common/FormElements';
import { Container, VStack, Card } from '../components/layout/LayoutPrimitives';
import { LoadingScreen, EmptyState } from '../components/common/StateComponents';

type EntityType = 'movie' | 'music' | 'short' | undefined;

export const HistoryPage: React.FC = () => {
  const [entityType, setEntityType] = useState<EntityType>(undefined);
  const [page, setPage] = useState(1);
  const { tokens } = useTheme();
  const { data: history, isLoading, error } = useHistory(entityType, page, 20);

  const totalPages = history?.totalPages || 1;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  if (isLoading) return <LoadingScreen />;
  if (error) return <EmptyState title="Error loading history" />;

  return (
    <Container size="md" style={{ paddingTop: tokens.spacing.lg }}>
      <VStack gap="lg">
        <VStack gap="sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>
            <Clock size={32} style={{ color: tokens.colors.primary }} />
            <h1 style={{ fontSize: tokens.typography.sizes.lg, fontWeight: 'bold', color: tokens.colors.text.primary }}>
              History
            </h1>
          </div>
          <p style={{ color: tokens.colors.text.tertiary }}>Your watch and listen history</p>
        </VStack>

        <div style={{ display: 'flex', gap: tokens.spacing.sm, flexWrap: 'wrap' }}>
          {['All', 'Movie', 'Music', 'Short'].map((type) => (
            <Button
              key={type}
              onClick={() => {
                setEntityType(type === 'All' ? undefined : (type.toLowerCase() as EntityType));
                setPage(1);
              }}
              variant={(type === 'All' && !entityType) || entityType === type.toLowerCase() ? 'primary' : 'secondary'}
              size="sm"
            >
              {type}
            </Button>
          ))}
        </div>

        {history && history.data.length === 0 ? (
          <EmptyState
            title="No history yet"
            description="Your watch and listen history will appear here"
          />
        ) : (
          <VStack gap="lg">
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
              {history?.data.map((item) => {
                const percentage = item.duration > 0 ? (item.progress / item.duration) * 100 : 0;
                return (
                  <Card
                    key={item.id}
                    style={{
                      backgroundColor: tokens.colors.background.secondary,
                      borderRadius: tokens.radius.lg,
                      padding: tokens.spacing.md,
                    }}
                  >
                    <VStack gap="md">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ color: tokens.colors.text.primary, fontWeight: '500' }}>
                            {item.entityType.charAt(0).toUpperCase() + item.entityType.slice(1)} (ID: {item.entityId})
                          </p>
                          <p style={{ color: tokens.colors.text.tertiary, fontSize: tokens.typography.sizes.sm }}>
                            {formatDate(item.watchedAt)}
                          </p>
                        </div>
                        <span
                          style={{
                            backgroundColor: tokens.colors.background.primary,
                            color: tokens.colors.text.tertiary,
                            padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
                            borderRadius: tokens.radius.md,
                            fontSize: tokens.typography.sizes.xs,
                          }}
                        >
                          {item.entityType}
                        </span>
                      </div>

                      <div>
                        <div
                          style={{
                            width: '100%',
                            backgroundColor: tokens.colors.background.primary,
                            borderRadius: tokens.radius.full,
                            height: '8px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: tokens.colors.primary,
                              height: '100%',
                              width: `${percentage}%`,
                              transition: `width ${tokens.transitions.normal}`,
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.sizes.xs, color: tokens.colors.text.tertiary }}>
                        <span>{formatDuration(item.progress)}</span>
                        <span>{Math.round(percentage)}%</span>
                        <span>{formatDuration(item.duration)}</span>
                      </div>

                      {percentage < 100 && (
                        <Button variant="primary" size="sm">
                          Resume
                        </Button>
                      )}
                    </VStack>
                  </Card>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: tokens.spacing.md }}>
                <Button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  variant="secondary"
                >
                  ← Previous
                </Button>
                <span style={{ color: tokens.colors.text.secondary }}>Page {page} of {totalPages}</span>
                <Button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  variant="primary"
                >
                  Next →
                </Button>
              </div>
            )}
          </VStack>
        )}

        {history && (
          <div style={{ paddingTop: tokens.spacing.lg, borderTop: `1px solid ${tokens.colors.background.secondary}`, color: tokens.colors.text.tertiary, fontSize: tokens.typography.sizes.sm }}>
            Total: {history.total} {history.total === 1 ? 'entry' : 'entries'}
          </div>
        )}
      </VStack>
    </Container>
  );
};
