import React, { useState } from 'react';
import { useMovies, useGenres } from '@hooks/useMovie';
import { MovieCard } from '@components/MovieCard';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '../components/common/FormElements';
import { Container, VStack, Grid } from '../components/layout/LayoutPrimitives';
import { SkeletonLoader } from '@components/Loading';
import { ErrorDisplay, EmptyState } from '@components/ErrorState';
import type { MovieFilters } from '@types/media';

export function MoviesPage(): JSX.Element {
  const [filters, setFilters] = useState<MovieFilters>({ page: 1, limit: 20 });
  const { tokens } = useTheme();

  const { data: moviesData, isLoading: moviesLoading, error: moviesError } = useMovies(filters);
  const { data: genres, isLoading: genresLoading } = useGenres();

  const handleGenreChange = (genre: string | undefined): void => {
    setFilters((prev) => ({ ...prev, genre, page: 1 }));
  };

  const handlePageChange = (page: number): void => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (moviesError) {
    return (
      <Container size="lg" style={{ paddingTop: tokens.spacing.lg }}>
        <ErrorDisplay message="Failed to load movies" onRetry={() => window.location.reload()} />
      </Container>
    );
  }

  return (
    <Container size="lg" style={{ paddingTop: tokens.spacing.lg }}>
      <VStack gap="lg">
        {/* Header */}
        <h1 style={{ fontSize: tokens.typography.sizes.lg, fontWeight: 'bold', color: tokens.colors.text.primary }}>
          🎬 Movies & TV
        </h1>

        {/* Genre Filter */}
        {genres && (
          <VStack gap="md">
            <div style={{ display: 'flex', gap: tokens.spacing.sm, flexWrap: 'wrap' }}>
              <Button
                onClick={() => handleGenreChange(undefined)}
                variant={!filters.genre ? 'primary' : 'secondary'}
                size="sm"
                disabled={moviesLoading}
              >
                All
              </Button>
              {genres.map((genre) => (
                <Button
                  key={genre}
                  onClick={() => handleGenreChange(genre)}
                  variant={filters.genre === genre ? 'primary' : 'secondary'}
                  size="sm"
                  disabled={moviesLoading}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </VStack>
        )}

        {/* Movies Grid */}
        {moviesLoading && genres === undefined ? (
          <SkeletonLoader />
        ) : moviesData && moviesData.items.length > 0 ? (
          <VStack gap="lg">
            <Grid columns={{ base: 2, sm: 3, md: 4, lg: 5 }}>
              {moviesData.items.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </Grid>

            {/* Pagination */}
            {moviesData.total > 20 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: tokens.spacing.md, paddingTop: tokens.spacing.lg }}>
                <Button
                  onClick={() => handlePageChange(Math.max(1, (filters.page || 1) - 1))}
                  disabled={(filters.page || 1) === 1 || moviesLoading}
                  variant="secondary"
                >
                  ← Previous
                </Button>
                <span style={{ color: tokens.colors.text.secondary }}>
                  Page {filters.page || 1}
                </span>
                <Button
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                  disabled={!moviesData.hasMore || moviesLoading}
                  variant="primary"
                >
                  Next →
                </Button>
              </div>
            )}
          </VStack>
        ) : (
          <EmptyState
            title="No movies found"
            description="Try adjusting your filters"
            action={{ label: 'Clear filters', onClick: () => setFilters({ page: 1, limit: 20 }) }}
          />
        )}
      </VStack>
    </Container>
  );
}
