import React, { useState } from 'react';
import { Music as MusicIcon } from 'lucide-react';
import MusicCard from '../components/MusicCard';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '../components/common/FormElements';
import { Container, VStack, Grid, Card, Section, Spacer } from '../components/layout/LayoutPrimitives';
import { SkeletonLoader } from '../components/Loading';
import { ErrorDisplay as ErrorState } from '../components/ErrorState';
import { useMusic, useGenres, useTrendingMusic } from '../hooks/useMusic';
import type { Music } from '../services/music';

const MusicPage: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState<Music | null>(null);
  const { tokens } = useTheme();

  const { data: musicData, isLoading, error } = useMusic(undefined, selectedGenre, page, 20);
  const { data: genresData } = useGenres();
  const { data: trendingData } = useTrendingMusic(5);

  const genres = genresData?.data || [];
  const music = musicData?.data || [];
  const pagination = musicData?.pagination;

  const handleSelectTrack = (track: Music) => {
    setSelectedTrack(track);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container size="lg" style={{ paddingTop: tokens.spacing.lg }}>
      <VStack gap="lg">
        {/* Header */}
        <Section title="Music Library" subtitle="Discover and stream millions of songs" icon={<MusicIcon size={32} />} />

        {/* Trending Section */}
        {trendingData?.data && trendingData.data.length > 0 && (
          <VStack gap="md">
            <h2 style={{ fontSize: tokens.typography.sizes.lg, fontWeight: 'bold', color: tokens.colors.text.primary }}>
              🔥 Trending Now
            </h2>
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 5 }}>
              {trendingData.data.map((track) => (
                <MusicCard
                  key={track.id}
                  music={track}
                  onPlay={handleSelectTrack}
                  isPlaying={selectedTrack?.id === track.id}
                />
              ))}
            </Grid>
          </VStack>
        )}

        {/* Genre Filter */}
        {genres.length > 0 && (
          <VStack gap="md">
            <h3 style={{ fontSize: tokens.typography.sizes.sm, fontWeight: '600', color: tokens.colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Filter by Genre
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.sm }}>
              <Button
                onClick={() => handleGenreChange('')}
                variant={selectedGenre === '' ? 'primary' : 'secondary'}
                size="sm"
                disabled={isLoading}
              >
                All
              </Button>
              {genres.slice(0, 10).map((genre) => (
                <Button
                  key={genre}
                  onClick={() => handleGenreChange(genre)}
                  variant={selectedGenre === genre ? 'primary' : 'secondary'}
                  size="sm"
                  disabled={isLoading}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </VStack>
        )}

        {/* Music Grid */}
        {isLoading ? (
          <SkeletonLoader count={20} columns={5} />
        ) : error ? (
          <ErrorState.ErrorDisplay message="Failed to load music" />
        ) : music.length === 0 ? (
          <ErrorState.EmptyState
            title="No music found"
            action={{
              label: 'Browse all music',
              onClick: () => {
                setSelectedGenre('');
                setPage(1);
              },
            }}
          />
        ) : (
          <VStack gap="lg">
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}>
              {music.map((track) => (
                <MusicCard
                  key={track.id}
                  music={track}
                  onPlay={handleSelectTrack}
                  isPlaying={selectedTrack?.id === track.id}
                />
              ))}
            </Grid>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing.md, paddingTop: tokens.spacing.lg }}>
                <Button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || isLoading}
                  variant="secondary"
                  size="md"
                >
                  ← Previous
                </Button>

                <span style={{ color: tokens.colors.text.secondary, fontSize: tokens.typography.sizes.sm }}>
                  Page {page} of {pagination.pages}
                </span>

                <Button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.pages || isLoading}
                  variant="primary"
                  size="md"
                >
                  Next →
                </Button>
              </div>
            )}
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default MusicPage;
