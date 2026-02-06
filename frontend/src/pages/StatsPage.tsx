import React from 'react';
import { BarChart3 } from 'lucide-react';
import { useEngagementStats } from '../hooks/useEngagement';
import { useTheme } from '../theme/ThemeProvider';
import { Container, VStack, Grid, Card } from '../components/layout/LayoutPrimitives';
import { LoadingScreen, EmptyState } from '../components/common/StateComponents';

export const StatsPage: React.FC = () => {
  const { tokens } = useTheme();
  const { data: stats, isLoading, error } = useEngagementStats();

  if (isLoading) return <LoadingScreen />;
  if (error) return <EmptyState title="Error loading statistics" />;

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <Container size="md" style={{ paddingTop: tokens.spacing.lg }}>
      <VStack gap="lg">
        {/* Header */}
        <VStack gap="sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>
            <BarChart3 size={32} style={{ color: tokens.colors.primary }} />
            <h1 style={{ fontSize: tokens.typography.sizes.lg, fontWeight: 'bold', color: tokens.colors.text.primary }}>
              Your Statistics
            </h1>
          </div>
          <p style={{ color: tokens.colors.text.tertiary }}>Your engagement summary across Movies Space</p>
        </VStack>

        {stats && (
          <>
            {/* Stats Grid */}
            <Grid columns={{ base: 1, sm: 2 }}>
              {[
                { label: 'Total Time Watched', value: formatHours(stats.totalMinutesWatched), color: tokens.colors.primary },
                { label: 'Watch Entries', value: stats.historyEntries, color: '#a855f7' },
                { label: 'Ratings Given', value: stats.ratingsCount, color: '#eab308' },
                { label: 'Favorites', value: stats.favoritesCount, color: '#ef4444' },
                { label: 'Movies in Watchlist', value: stats.watchlistCount, color: '#06b6d4' },
                { label: 'Total Interactions', value: stats.ratingsCount + stats.favoritesCount + stats.watchlistCount, color: '#22c55e' },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`,
                    border: `1px solid ${stat.color}40`,
                    borderRadius: tokens.radius.lg,
                    padding: tokens.spacing.lg,
                    textAlign: 'center',
                  }}
                >
                  <VStack gap="sm" align="center">
                    <div
                      style={{
                        fontSize: tokens.typography.sizes.xl,
                        fontWeight: 'bold',
                        color: stat.color,
                      }}
                    >
                      {stat.value}
                    </div>
                    <p style={{ color: tokens.colors.text.secondary, fontSize: tokens.typography.sizes.sm }}>
                      {stat.label}
                    </p>
                  </VStack>
                </Card>
              ))}
            </Grid>

            {/* Breakdown */}
            <Card style={{ backgroundColor: tokens.colors.background.secondary, borderRadius: tokens.radius.lg, padding: tokens.spacing.lg }}>
              <VStack gap="lg">
                <h2 style={{ fontSize: tokens.typography.sizes.md, fontWeight: 'bold', color: tokens.colors.text.primary }}>
                  Breakdown
                </h2>

                <VStack gap="md">
                  {/* Time Watched Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing.sm }}>
                      <span style={{ color: tokens.colors.text.secondary }}>Total Time Watched</span>
                      <span style={{ color: tokens.colors.text.primary, fontWeight: '500' }}>
                        {formatHours(stats.totalMinutesWatched)}
                      </span>
                    </div>
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
                          width: `${Math.min(100, (stats.totalMinutesWatched / 1000) * 100)}%`,
                          borderRadius: tokens.radius.full,
                        }}
                      />
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div style={{ paddingTop: tokens.spacing.md, borderTop: `1px solid ${tokens.colors.background.primary}` }}>
                    <h3 style={{ fontSize: tokens.typography.sizes.sm, fontWeight: '600', color: tokens.colors.text.primary, marginBottom: tokens.spacing.md }}>
                      Your Engagement
                    </h3>
                    <VStack gap="sm">
                      {[
                        { label: 'Ratings Given', value: stats.ratingsCount },
                        { label: 'Favorites Added', value: stats.favoritesCount },
                        { label: 'Movies in Watchlist', value: stats.watchlistCount },
                        { label: 'Watch History Entries', value: stats.historyEntries },
                      ].map((item) => (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: tokens.colors.text.secondary }}>{item.label}</span>
                          <span style={{ color: tokens.colors.text.primary, fontWeight: '500' }}>{item.value}</span>
                        </div>
                      ))}
                    </VStack>
                  </div>
                </VStack>
              </VStack>
            </Card>

            {/* Footer */}
            <div style={{ paddingTop: tokens.spacing.lg, borderTop: `1px solid ${tokens.colors.background.secondary}`, color: tokens.colors.text.tertiary, fontSize: tokens.typography.sizes.sm, textAlign: 'center' }}>
              Statistics are updated in real-time based on your interactions
            </div>
          </>
        )}
      </VStack>
    </Container>
  );
};
