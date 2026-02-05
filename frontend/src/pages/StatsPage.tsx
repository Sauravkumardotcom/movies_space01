import React from 'react';
import { useEngagementStats } from '../hooks/useEngagement';

/**
 * StatsPage Component
 * Display user engagement statistics and summary
 */
export const StatsPage: React.FC = () => {
  const { data: stats, isLoading, error } = useEngagementStats();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-gray-600'>Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-red-600'>Error loading statistics</div>
      </div>
    );
  }

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      {/* Header */}
      <div className='mb-12'>
        <h1 className='text-4xl font-bold text-white mb-2'>Your Statistics</h1>
        <p className='text-gray-400'>Your engagement summary across Movies Space</p>
      </div>

      {stats && (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12'>
          {/* Total Watched */}
          <div className='bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 text-center'>
            <div className='text-4xl font-bold text-blue-300 mb-2'>
              {formatHours(stats.totalMinutesWatched)}
            </div>
            <p className='text-gray-300 text-sm'>Total Time Watched</p>
            <p className='text-gray-500 text-xs mt-2'>({stats.totalMinutesWatched} minutes)</p>
          </div>

          {/* History Entries */}
          <div className='bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 text-center'>
            <div className='text-4xl font-bold text-purple-300 mb-2'>{stats.historyEntries}</div>
            <p className='text-gray-300 text-sm'>
              {stats.historyEntries === 1 ? 'Watch Entry' : 'Watch Entries'}
            </p>
          </div>

          {/* Ratings */}
          <div className='bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg p-6 text-center'>
            <div className='text-4xl font-bold text-yellow-300 mb-2'>{stats.ratingsCount}</div>
            <p className='text-gray-300 text-sm'>
              {stats.ratingsCount === 1 ? 'Rating' : 'Ratings'} Given
            </p>
          </div>

          {/* Favorites */}
          <div className='bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-6 text-center'>
            <div className='text-4xl font-bold text-red-300 mb-2'>{stats.favoritesCount}</div>
            <p className='text-gray-300 text-sm'>
              {stats.favoritesCount === 1 ? 'Favorite' : 'Favorites'}
            </p>
          </div>

          {/* Watchlist */}
          <div className='bg-gradient-to-br from-blue-900 to-cyan-800 rounded-lg p-6 text-center'>
            <div className='text-4xl font-bold text-cyan-300 mb-2'>{stats.watchlistCount}</div>
            <p className='text-gray-300 text-sm'>
              {stats.watchlistCount === 1 ? 'Movie' : 'Movies'} in Watchlist
            </p>
          </div>

          {/* Engagement Score */}
          <div className='bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 text-center'>
            <div className='text-4xl font-bold text-green-300 mb-2'>
              {stats.ratingsCount + stats.favoritesCount + stats.watchlistCount}
            </div>
            <p className='text-gray-300 text-sm'>Total Interactions</p>
          </div>
        </div>
      )}

      {/* Breakdown */}
      {stats && (
        <div className='bg-gray-800 rounded-lg p-8'>
          <h2 className='text-2xl font-bold text-white mb-6'>Breakdown</h2>

          <div className='space-y-6'>
            {/* Time Watched */}
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-gray-300'>Total Time Watched</span>
                <span className='text-white font-medium'>{formatHours(stats.totalMinutesWatched)}</span>
              </div>
              <div className='w-full bg-gray-700 rounded-full h-2'>
                <div
                  className='bg-blue-500 h-2 rounded-full'
                  style={{
                    width: `${Math.min(100, (stats.totalMinutesWatched / 1000) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Ratings Distribution */}
            <div className='pt-4 border-t border-gray-700'>
              <h3 className='text-lg font-medium text-white mb-4'>Your Engagement</h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Ratings Given</span>
                  <span className='text-white font-medium'>{stats.ratingsCount}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Favorites Added</span>
                  <span className='text-white font-medium'>{stats.favoritesCount}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Movies in Watchlist</span>
                  <span className='text-white font-medium'>{stats.watchlistCount}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Watch History Entries</span>
                  <span className='text-white font-medium'>{stats.historyEntries}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className='mt-12 pt-8 border-t border-gray-700'>
        <p className='text-gray-500 text-sm text-center'>
          Statistics are updated in real-time based on your interactions
        </p>
      </div>
    </div>
  );
};
