import React, { useState } from 'react';
import { Search, Music as MusicIcon } from 'lucide-react';
import MusicCard from '../components/MusicCard';
import { Loading } from '../components/Loading';
import { ErrorDisplay as ErrorState } from '../components/ErrorState';
import { useMusic, useGenres, useTrendingMusic } from '../hooks/useMusic';
import type { Music } from '../services/music';

const MusicPage: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState<Music | null>(null);

  const { data: musicData, isLoading, error } = useMusic(undefined, selectedGenre, page, 20);
  const { data: genresData } = useGenres();
  const { data: trendingData } = useTrendingMusic(5);

  const genres = genresData?.data || [];
  const music = musicData?.data || [];
  const pagination = musicData?.pagination;

  const handleSelectTrack = (track: Music) => {
    setSelectedTrack(track);
    // TODO: Play track in global audio player
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
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <MusicIcon size={32} className="text-blue-500" />
          <h1 className="text-3xl font-bold text-white">Music Library</h1>
        </div>
        <p className="text-slate-400">Discover and stream millions of songs</p>
      </div>

      {/* Trending Section */}
      {trendingData?.data && trendingData.data.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">🔥</span> Trending Now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {trendingData.data.map((track) => (
              <MusicCard
                key={track.id}
                music={track}
                onPlay={handleSelectTrack}
                isPlaying={selectedTrack?.id === track.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Genre Filter */}
      {genres.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase">Filter by Genre</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleGenreChange('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedGenre === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              disabled={isLoading}
            >
              All
            </button>
            {genres.slice(0, 10).map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreChange(genre)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedGenre === genre
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                disabled={isLoading}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Music Grid */}
      {isLoading ? (
        <Loading.SkeletonLoader count={20} columns={5} />
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {music.map((track) => (
              <MusicCard
                key={track.id}
                music={track}
                onPlay={handleSelectTrack}
                isPlaying={selectedTrack?.id === track.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || isLoading}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                ← Previous
              </button>

              <span className="text-slate-300 text-sm">
                Page {page} of {pagination.pages}
              </span>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.pages || isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MusicPage;
