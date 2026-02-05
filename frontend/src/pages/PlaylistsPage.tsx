import React, { useState } from 'react';
import { ListMusic, Plus, Loader } from 'lucide-react';
import PlaylistCard from '../components/PlaylistCard';
import { SkeletonLoader } from '../components/Loading';
import { ErrorDisplay as ErrorState } from '../components/ErrorState';
import {
  useUserPlaylists,
  useCreatePlaylist,
  useDeletePlaylist,
  usePlaylistDetail,
} from '../hooks/useMusic';

interface PlaylistListItem {
  id: string;
  title: string;
  description?: string;
  songCount: number;
}

const PlaylistsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const { data: playlistsData, isLoading, error } = useUserPlaylists(page, 20);
  const createMutation = useCreatePlaylist();
  const deleteMutation = useDeletePlaylist();
  const { data: selectedData } = usePlaylistDetail(selectedPlaylist);

  const playlists = playlistsData?.data || [];
  const pagination = playlistsData?.pagination;

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) return;

    try {
      await createMutation.mutateAsync({
        title: newPlaylistTitle,
        description: newPlaylistDesc,
      });
      setNewPlaylistTitle('');
      setNewPlaylistDesc('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      if (selectedPlaylist === id) {
        setSelectedPlaylist(null);
      }
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
  };

  const handlePlaylistSelect = (id: string) => {
    setSelectedPlaylist(selectedPlaylist === id ? null : id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ListMusic size={32} className="text-blue-500" />
            <h1 className="text-3xl font-bold text-white">Your Playlists</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            <Plus size={20} />
            New Playlist
          </button>
        </div>

        {/* Playlists Grid */}
        {isLoading ? (
          <SkeletonLoader count={9} columns={3} />
        ) : error ? (
          <ErrorState.ErrorDisplay message="Failed to load playlists" />
        ) : playlists.length === 0 ? (
          <ErrorState.EmptyState
            title="No playlists yet"
            action={{
              label: 'Create your first playlist',
              onClick: () => setShowCreateModal(true),
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onClick={() => handlePlaylistSelect(playlist.id)}
                  onDelete={handleDeletePlaylist}
                  isLoading={deleteMutation.isPending}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || isLoading}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded transition-colors"
                >
                  ← Previous
                </button>

                <span className="text-slate-300">
                  Page {page} of {pagination.pages}
                </span>

                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page >= pagination.pages || isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sidebar - Playlist Details */}
      <div className="lg:col-span-1">
        {selectedPlaylist && selectedData ? (
          <div className="bg-slate-800 rounded-lg p-4 sticky top-4 space-y-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white truncate">
              {selectedData.title}
            </h2>

            {selectedData.description && (
              <p className="text-sm text-slate-400">{selectedData.description}</p>
            )}

            <div className="space-y-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-400">Songs:</span> {selectedData.songs.length}
              </p>
              <p>
                <span className="text-slate-400">Duration:</span>{' '}
                {Math.floor(selectedData.songs.reduce((acc, s) => acc + s.duration, 0) / 60)} min
              </p>
              <p>
                <span className="text-slate-400">Created:</span>{' '}
                {new Date(selectedData.createdAt).toLocaleDateString()}
              </p>
            </div>

            {selectedData.songs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-300">Songs</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedData.songs.map((song, idx) => (
                    <div
                      key={song.id}
                      className="bg-slate-700 rounded p-2 text-xs space-y-1"
                    >
                      <p className="text-white font-medium truncate">
                        {idx + 1}. {song.title}
                      </p>
                      <p className="text-slate-400 truncate">{song.artist}</p>
                      <p className="text-slate-500">
                        {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg p-6 text-center text-slate-400">
            <ListMusic size={32} className="mx-auto mb-2 text-slate-600" />
            <p>Select a playlist to view details</p>
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <h2 className="text-xl font-semibold text-white">Create New Playlist</h2>

            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistTitle}
              onChange={(e) => setNewPlaylistTitle(e.target.value)}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            <textarea
              placeholder="Description (optional)"
              value={newPlaylistDesc}
              onChange={(e) => setNewPlaylistDesc(e.target.value)}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPlaylistTitle('');
                  setNewPlaylistDesc('');
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                disabled={createMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistTitle.trim() || createMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded transition-colors flex items-center justify-center gap-2"
              >
                {createMutation.isPending && <Loader size={16} className="animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
