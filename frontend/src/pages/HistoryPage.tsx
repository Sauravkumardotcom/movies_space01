import React, { useState } from 'react';
import { useHistory } from '../hooks/useEngagement';

type EntityType = 'movie' | 'music' | 'short' | undefined;

/**
 * HistoryPage Component
 * Display user's watch/listen history with resume functionality
 */
export const HistoryPage: React.FC = () => {
  const [entityType, setEntityType] = useState<EntityType>(undefined);
  const [page, setPage] = useState(1);
  const { data: history, isLoading, error } = useHistory(entityType, page, 20);

  const totalPages = history?.totalPages || 1;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-gray-600'>Loading history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-red-600'>Error loading history</div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-white mb-2'>History</h1>
        <p className='text-gray-400'>Your watch and listen history</p>
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
      {history && history.data.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-400'>No history yet</p>
          <p className='text-gray-500 text-sm mt-2'>Your watch and listen history will appear here</p>
        </div>
      ) : (
        <>
          {/* History List */}
          <div className='space-y-4 mb-8'>
            {history?.data.map((item) => {
              const percentage = item.duration > 0 ? (item.progress / item.duration) * 100 : 0;

              return (
                <div
                  key={item.id}
                  className='bg-gray-800 rounded p-4 hover:bg-gray-750 transition-colors'
                >
                  {/* Header */}
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <p className='text-white font-medium'>
                        {item.entityType.charAt(0).toUpperCase() + item.entityType.slice(1)} (ID: {item.entityId})
                      </p>
                      <p className='text-gray-400 text-sm'>{formatDate(item.watchedAt)}</p>
                    </div>
                    <span className='text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded'>
                      {item.entityType}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className='mb-2'>
                    <div className='w-full bg-gray-700 rounded-full h-2 overflow-hidden'>
                      <div
                        className='bg-blue-500 h-full transition-all'
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className='flex justify-between items-center text-xs text-gray-400'>
                    <span>{formatDuration(item.progress)}</span>
                    <span>{Math.round(percentage)}%</span>
                    <span>{formatDuration(item.duration)}</span>
                  </div>

                  {/* Resume Button */}
                  {percentage < 100 && (
                    <button className='mt-3 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors'>
                      Resume
                    </button>
                  )}
                </div>
              );
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
      {history && (
        <div className='mt-12 pt-8 border-t border-gray-700'>
          <p className='text-gray-400 text-sm'>
            Total: {history.total} {history.total === 1 ? 'entry' : 'entries'}
          </p>
        </div>
      )}
    </div>
  );
};
