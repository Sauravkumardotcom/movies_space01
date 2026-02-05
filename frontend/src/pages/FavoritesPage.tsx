import React, { useState } from 'react';
import { useFavorites } from '../hooks/useEngagement';
import { MovieCard } from '../components/MovieCard';
import { MusicCard } from '../components/MusicCard';

type EntityType = 'movie' | 'music' | 'short' | undefined;

/**
 * FavoritesPage Component
 * Display user's favorite movies, music, and shorts
 */
export const FavoritesPage: React.FC = () => {
  const [entityType, setEntityType] = useState<EntityType>(undefined);
  const [page, setPage] = useState(1);
  const { data: favorites, isLoading, error } = useFavorites(entityType, page, 20);

  const totalPages = favorites?.totalPages || 1;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-gray-600'>Loading favorites...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-red-600'>Error loading favorites</div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-white mb-2'>Favorites</h1>
        <p className='text-gray-400'>Your favorite movies, music, and shorts</p>
      </div>

      {/* Filters */}
      <div className='flex gap-2 mb-8 flex-wrap'>
        {['All', 'Movie', 'Music', 'Short'].map((type) => (
          <button
            key={type}
            onClick={() => {
              setEntityType(type === 'All' ? undefined : (type.toLowerCase() as EntityType));
              setPage(1);
            }}
            className={`px-4 py-2 rounded transition-colors ${
              (type === 'All' && !entityType) || entityType === type.toLowerCase()
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {favorites && favorites.data.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-400'>No favorites yet</p>
          <p className='text-gray-500 text-sm mt-2'>Add items to your favorites to see them here</p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
            {favorites?.data.map((favorite) => {
              if (favorite.entityType === 'music') {
                return <MusicCard key={favorite.id} musicId={favorite.entityId} />;
              }
              return <MovieCard key={favorite.id} movieId={favorite.entityId} />;
            })}
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
      {favorites && (
        <div className='mt-12 pt-8 border-t border-gray-700'>
          <p className='text-gray-400 text-sm'>
            Total: {favorites.total} {entityType || 'items'}
          </p>
        </div>
      )}
    </div>
  );
};
