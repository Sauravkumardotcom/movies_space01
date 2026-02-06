import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useWatchlist } from '../hooks/useEngagement';
import { MovieCard } from '../components/MovieCard';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '../components/common/FormElements';
import { Container, VStack, Grid } from '../components/layout/LayoutPrimitives';
import { LoadingScreen, EmptyState } from '../components/common/StateComponents';

export const WatchlistPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { tokens } = useTheme();
  const { data: watchlist, isLoading, error } = useWatchlist(page, 20);

  const totalPages = watchlist?.totalPages || 1;

  if (isLoading) return <LoadingScreen />;
  if (error) return <EmptyState title="Error loading watchlist" />;

  return (
    <Container size="lg" style={{ paddingTop: tokens.spacing.lg }}>
      <VStack gap="lg">
        <VStack gap="sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>
            <Bookmark size={32} style={{ color: tokens.colors.primary }} />
            <h1 style={{ fontSize: tokens.typography.sizes.lg, fontWeight: 'bold', color: tokens.colors.text.primary }}>
              Watchlist
            </h1>
          </div>
          <p style={{ color: tokens.colors.text.tertiary }}>Movies you plan to watch</p>
        </VStack>

        {watchlist && watchlist.data.length === 0 ? (
          <EmptyState
            title="Your watchlist is empty"
            description="Add movies to your watchlist to see them here"
          />
        ) : (
          <VStack gap="lg">
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }}>
              {watchlist?.data.map((item) => (
                <MovieCard key={item.id} movieId={item.movieId} />
              ))}
            </Grid>

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

        {watchlist && (
          <div style={{ paddingTop: tokens.spacing.lg, borderTop: `1px solid ${tokens.colors.background.secondary}`, color: tokens.colors.text.tertiary, fontSize: tokens.typography.sizes.sm }}>
            Total: {watchlist.total} {watchlist.total === 1 ? 'movie' : 'movies'}
          </div>
        )}
      </VStack>
    </Container>
  );
};
