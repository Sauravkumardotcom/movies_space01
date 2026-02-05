import React, { useState } from 'react';
import { useWatchlist } from '../hooks/useEngagement';
import { MovieCard } from '../movies/MovieCard';

/**
 * WatchlistPage Component
 * Display user's movie watchlist
 */
export const WatchlistPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data: watchlist, isLoading, error } = useWatchlist(page, 20);

  const totalPages = watchlist?.totalPages || 1;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-gray-600'>Loading watchlist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-red-600'>Error loading watchlist</div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-white mb-2'>Watchlist</h1>
        <p className='text-gray-400'>Movies you plan to watch</p>
      </div>

      {/* Empty State */}
      {watchlist && watchlist.data.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-400'>Your watchlist is empty</p>
          <p className='text-gray-500 text-sm mt-2'>Add movies to your watchlist to see them here</p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
            {watchlist?.data.map((item) => (
              <MovieCard key={item.id} movieId={item.movieId} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex justify-center items-center gap-4 mt-8'>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className='px-4 py-2 bg-gray-700 text-gray-300 rounded disabled:opacity-50 hover:bg-gray-600'
              >
                Previous
              </button>
              <span className='text-gray-400'>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className='px-4 py-2 bg-gray-700 text-gray-300 rounded disabled:opacity-50 hover:bg-gray-600'
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Stats */}
      {watchlist && (
        <div className='mt-12 pt-8 border-t border-gray-700'>
          <p className='text-gray-400 text-sm'>
            Total: {watchlist.total} {watchlist.total === 1 ? 'movie' : 'movies'}
          </p>
        </div>
      )}
    </div>
  );
};
