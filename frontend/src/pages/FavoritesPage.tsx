import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '../hooks/useEngagement';
import { MovieCard } from '../components/MovieCard';
import { MusicCard } from '../components/MusicCard';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '../components/common/FormElements';
import { Container, VStack, Grid } from '../components/layout/LayoutPrimitives';
import { LoadingScreen, EmptyState } from '../components/common/StateComponents';

type EntityType = 'movie' | 'music' | 'short' | undefined;

export const FavoritesPage: React.FC = () => {
  const [entityType, setEntityType] = useState<EntityType>(undefined);
  const [page, setPage] = useState(1);
  const { tokens } = useTheme();
  const { data: favorites, isLoading, error } = useFavorites(entityType, page, 20);

  const totalPages = favorites?.totalPages || 1;

  if (isLoading) return <LoadingScreen />;
  if (error) return <EmptyState title="Error loading favorites" />;

  return (
    <Container size="lg" style={{ paddingTop: tokens.spacing.lg }}>
      <VStack gap="lg">
        {/* Header */}
        <VStack gap="sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>
            <Heart size={32} style={{ color: tokens.colors.primary }} />
            <h1 style={{ fontSize: tokens.typography.sizes.lg, fontWeight: 'bold', color: tokens.colors.text.primary }}>
              Favorites
            </h1>
          </div>
          <p style={{ color: tokens.colors.text.tertiary }}>Your favorite movies, music, and shorts</p>
        </VStack>

        {/* Filters */}
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

        {/* Content */}
        {favorites && favorites.data.length === 0 ? (
          <EmptyState
            title="No favorites yet"
            description="Add items to your favorites to see them here"
          />
        ) : (
          <VStack gap="lg">
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }}>
              {favorites?.data.map((favorite) => {
                if (favorite.entityType === 'music') {
                  return <MusicCard key={favorite.id} musicId={favorite.entityId} />;
                }
                return <MovieCard key={favorite.id} movieId={favorite.entityId} />;
              })}
            </Grid>

            {/* Pagination */}
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

        {/* Stats */}
        {favorites && (
          <div style={{ paddingTop: tokens.spacing.lg, borderTop: `1px solid ${tokens.colors.background.secondary}`, color: tokens.colors.text.tertiary, fontSize: tokens.typography.sizes.sm }}>
            Total: {favorites.total} {entityType || 'items'}
          </div>
        )}
      </VStack>
    </Container>
  );
};
