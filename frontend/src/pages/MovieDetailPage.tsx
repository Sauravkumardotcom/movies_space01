import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovie, useAddToWatchlist, useRemoveFromWatchlist, useSubmitRating } from '@hooks/useMovie';
import { useTheme } from '../theme/ThemeProvider';
import { Container, VStack, Flex } from '../components/layout/LayoutPrimitives';
import { Button } from '../components/common/FormElements';
import { LoadingSpinner } from '@components/Loading';
import { ErrorDisplay } from '@components/ErrorState';
import { Heart, Star, Bookmark, ArrowLeft } from 'lucide-react';

export function MovieDetailPage(): JSX.Element {
  const { id: movieId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tokens } = useTheme();
  const [userRating, setUserRating] = useState(0);

  const { data: movie, isLoading, error } = useMovie(movieId);
  const addToWatchlist = useAddToWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();
  const submitRating = useSubmitRating();

  if (error) {
    return (
      <Container size="lg" style={{ paddingTop: tokens.spacing.lg }}>
        <ErrorDisplay 
          message="Failed to load movie details" 
          onRetry={() => window.location.reload()} 
        />
      </Container>
    );
  }

  if (isLoading || !movie) {
    return (
      <Container size="lg" style={{ paddingTop: tokens.spacing.lg }}>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </Container>
    );
  }

  const handleAddToWatchlist = async (): Promise<void> => {
    try {
      await addToWatchlist.mutateAsync(movie.id);
    } catch (err) {
      console.error('Error adding to watchlist:', err);
    }
  };

  const handleRating = async (rating: number): Promise<void> => {
    try {
      setUserRating(rating);
      await submitRating.mutateAsync({
        entityId: movie.id,
        entityType: 'movie',
        rating,
      });
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };

  return (
    <Container size="lg" style={{ paddingTop: tokens.spacing.lg, paddingBottom: tokens.spacing.lg }}>
      <VStack gap="lg">
        {/* Back Button */}
        <button
          onClick={() => navigate('/movies')}
          style={{ color: tokens.colors.primary }}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Movies</span>
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Poster */}
          <div>
            {movie.posterUrl && (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                style={{
                  borderRadius: tokens.radius.lg,
                  boxShadow: tokens.shadows.lg,
                }}
                className="w-full object-cover"
              />
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <h1
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: 'bold',
                  color: tokens.colors.text,
                }}
              >
                {movie.title}
              </h1>
            </div>

            {/* Movie Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm }}>
                  Type
                </p>
                <p
                  style={{ color: tokens.colors.text, fontWeight: '600' }}
                  className="capitalize"
                >
                  {movie.type}
                </p>
              </div>
              <div>
                <p style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm }}>
                  Year
                </p>
                <p style={{ color: tokens.colors.text, fontWeight: '600' }}>
                  {movie.year}
                </p>
              </div>
              <div>
                <p style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm }}>
                  Director
                </p>
                <p style={{ color: tokens.colors.text, fontWeight: '600' }}>
                  {movie.director}
                </p>
              </div>
              <div>
                <p style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm }}>
                  Rating
                </p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" style={{ color: tokens.colors.primary }} />
                  <p style={{ color: tokens.colors.text, fontWeight: '600' }}>
                    {movie.rating.toFixed(1)}/5
                  </p>
                </div>
              </div>
            </div>

            {/* Genres */}
            <div>
              <p style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing.sm }}>
                Genres
              </p>
              <Flex direction="row" gap="sm" wrap>
                {movie.genre.map((g) => (
                  <span
                    key={g}
                    style={{
                      backgroundColor: tokens.colors.surfaceSecondary,
                      color: tokens.colors.text,
                      borderRadius: tokens.radius.full,
                      padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
                      fontSize: tokens.typography.fontSize.xs,
                    }}
                  >
                    {g}
                  </span>
                ))}
              </Flex>
            </div>

            {/* Description */}
            <div>
              <p style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.fontSize.sm, marginBottom: tokens.spacing.md }}>
                Description
              </p>
              <p style={{ color: tokens.colors.text, lineHeight: '1.6' }}>
                {movie.description}
              </p>
            </div>

            {/* Your Rating */}
            <div>
              <p style={{ color: tokens.colors.textMuted, fontSize: tokens.typography.sizes.sm, marginBottom: tokens.spacing.md }}>
                Rate this movie
              </p>
              <Flex direction="row" gap="sm">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRating(rating)}
                    style={{
                      backgroundColor:
                        userRating >= rating
                          ? tokens.colors.primary
                          : tokens.colors.surfaceSecondary,
                      color: tokens.colors.text,
                      borderRadius: tokens.radius.md,
                    }}
                    className="w-10 h-10 font-semibold hover:opacity-80 transition-opacity"
                  >
                    {rating}
                  </button>
                ))}
              </Flex>
            </div>

            {/* Action Buttons */}
            <Flex direction="row" gap="md">
              <Button
                variant="primary"
                onClick={handleAddToWatchlist}
                disabled={addToWatchlist.isPending}
              >
                <Bookmark className="w-4 h-4" />
                Add to Watchlist
              </Button>
              <Button variant="secondary">
                <Heart className="w-4 h-4" />
                Like
              </Button>
            </Flex>
          </div>
        </div>

        {/* Reviews Section */}
        {movie.ratings && movie.ratings.length > 0 && (
          <div style={{ marginTop: tokens.spacing.xl }}>
            <h2
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: 'bold',
                color: tokens.colors.text,
                marginBottom: tokens.spacing.lg,
              }}
            >
              Recent Reviews
            </h2>
            <div className="space-y-4">
              {movie.ratings.slice(0, 5).map((rating) => (
                <div
                  key={rating.id}
                  style={{
                    backgroundColor: tokens.colors.surface,
                    borderRadius: tokens.radius.md,
                    padding: tokens.spacing.md,
                  }}
                >
                  <Flex direction="row" justify="between" align="center" className="mb-2">
                    <p style={{ color: tokens.colors.text, fontWeight: '600' }}>
                      {rating.user.username}
                    </p>
                    <Flex direction="row" gap="xs">
                      {Array.from({ length: rating.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4"
                          style={{ color: tokens.colors.primary, fill: tokens.colors.primary }}
                        />
                      ))}
                    </Flex>
                  </Flex>
                  {rating.comment && (
                    <p style={{ color: tokens.colors.textMuted }}>
                      {rating.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </VStack>
    </Container>
  );
}
