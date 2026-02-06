import React, { useState } from 'react';
import { ListMusic, Plus, Loader } from 'lucide-react';
import PlaylistCard from '../components/PlaylistCard';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '../components/common/FormElements';
import { Input } from '../components/common/FormElements';
import { Container, VStack, HStack, Card, Grid } from '../components/layout/LayoutPrimitives';
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
  const { tokens } = useTheme();

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

  return (
    <Container size="lg" style={{ paddingTop: tokens.spacing.lg }}>
      <Grid columns={{ base: 1, lg: 3 }} gap="lg">
        {/* Main Content */}
        <div style={{ gridColumn: 'span 2' }}>
          <VStack gap="lg">
            {/* Header */}
            <HStack gap="md" justify="space-between" align="center">
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.md }}>
                <ListMusic size={32} style={{ color: tokens.colors.primary }} />
                <h1 style={{ fontSize: tokens.typography.sizes.lg, fontWeight: 'bold', color: tokens.colors.text.primary }}>
                  Your Playlists
                </h1>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="primary"
                size="md"
              >
                <Plus size={20} style={{ marginRight: tokens.spacing.xs }} />
                New Playlist
              </Button>
            </HStack>

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
              <VStack gap="lg">
                <Grid columns={{ base: 1, sm: 2, md: 3 }}>
                  {playlists.map((playlist) => (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      onClick={() => setSelectedPlaylist(playlist.id)}
                      onDelete={handleDeletePlaylist}
                      isLoading={deleteMutation.isPending}
                    />
                  ))}
                </Grid>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <HStack gap="md" justify="center">
                    <Button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1 || isLoading}
                      variant="secondary"
                    >
                      ← Previous
                    </Button>

                    <span style={{ color: tokens.colors.text.secondary }}>
                      Page {page} of {pagination.pages}
                    </span>

                    <Button
                      onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                      disabled={page >= pagination.pages || isLoading}
                      variant="primary"
                    >
                      Next →
                    </Button>
                  </HStack>
                )}
              </VStack>
            )}
          </VStack>
        </div>

        {/* Sidebar - Playlist Details */}
        <div>
          {selectedPlaylist && selectedData ? (
            <Card
              style={{
                backgroundColor: tokens.colors.background.secondary,
                borderRadius: tokens.radius.lg,
                padding: tokens.spacing.md,
                position: 'sticky',
                top: tokens.spacing.md,
                maxHeight: 'calc(100vh - 2rem)',
                overflowY: 'auto',
              }}
            >
              <VStack gap="md">
                <h2 style={{ fontSize: tokens.typography.sizes.md, fontWeight: '600', color: tokens.colors.text.primary, lineClamp: 1 }}>
                  {selectedData.title}
                </h2>

                {selectedData.description && (
                  <p style={{ fontSize: tokens.typography.sizes.sm, color: tokens.colors.text.secondary }}>
                    {selectedData.description}
                  </p>
                )}

                <VStack gap="sm">
                  <p style={{ fontSize: tokens.typography.sizes.sm, color: tokens.colors.text.secondary }}>
                    <span style={{ color: tokens.colors.text.tertiary }}>Songs:</span> {selectedData.songs.length}
                  </p>
                  <p style={{ fontSize: tokens.typography.sizes.sm, color: tokens.colors.text.secondary }}>
                    <span style={{ color: tokens.colors.text.tertiary }}>Duration:</span>{' '}
                    {Math.floor(selectedData.songs.reduce((acc: number, s: any) => acc + s.duration, 0) / 60)} min
                  </p>
                  <p style={{ fontSize: tokens.typography.sizes.sm, color: tokens.colors.text.secondary }}>
                    <span style={{ color: tokens.colors.text.tertiary }}>Created:</span>{' '}
                    {new Date(selectedData.createdAt).toLocaleDateString()}
                  </p>
                </VStack>

                {selectedData.songs.length > 0 && (
                  <VStack gap="sm">
                    <h3 style={{ fontSize: tokens.typography.sizes.sm, fontWeight: '600', color: tokens.colors.text.secondary }}>
                      Songs
                    </h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: tokens.spacing.sm }}>
                      {selectedData.songs.map((song: any, idx: number) => (
                        <Card
                          key={song.id}
                          style={{
                            backgroundColor: tokens.colors.background.primary,
                            borderRadius: tokens.radius.md,
                            padding: tokens.spacing.sm,
                          }}
                        >
                          <VStack gap="xs">
                            <p style={{ fontSize: tokens.typography.sizes.xs, fontWeight: '500', color: tokens.colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {idx + 1}. {song.title}
                            </p>
                            <p style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.text.tertiary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {song.artist}
                            </p>
                            <p style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.text.tertiary }}>
                              {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                            </p>
                          </VStack>
                        </Card>
                      ))}
                    </div>
                  </VStack>
                )}
              </VStack>
            </Card>
          ) : (
            <Card
              style={{
                backgroundColor: tokens.colors.background.secondary,
                borderRadius: tokens.radius.lg,
                padding: tokens.spacing.lg,
                textAlign: 'center',
              }}
            >
              <VStack gap="md" align="center">
                <ListMusic size={32} style={{ color: tokens.colors.text.tertiary }} />
                <p style={{ color: tokens.colors.text.tertiary }}>Select a playlist to view details</p>
              </VStack>
            </Card>
          )}
        </div>
      </Grid>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <Card style={{ backgroundColor: tokens.colors.background.secondary, borderRadius: tokens.radius.lg, padding: tokens.spacing.lg, maxWidth: '400px', width: '90%' }}>
            <VStack gap="lg">
              <h2 style={{ fontSize: tokens.typography.sizes.md, fontWeight: 'bold', color: tokens.colors.text.primary }}>
                Create New Playlist
              </h2>

              <VStack gap="md">
                <input
                  type="text"
                  placeholder="Playlist name"
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: tokens.colors.input.background,
                    color: tokens.colors.input.text,
                    borderRadius: tokens.radius.md,
                    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                    border: `1px solid ${tokens.colors.input.border}`,
                    fontSize: tokens.typography.sizes.sm,
                  }}
                  autoFocus
                />

                <textarea
                  placeholder="Description (optional)"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: tokens.colors.input.background,
                    color: tokens.colors.input.text,
                    borderRadius: tokens.radius.md,
                    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                    border: `1px solid ${tokens.colors.input.border}`,
                    fontSize: tokens.typography.sizes.sm,
                    fontFamily: 'inherit',
                    resize: 'none',
                    height: '80px',
                  }}
                />

                <HStack gap="md">
                  <Button
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewPlaylistTitle('');
                      setNewPlaylistDesc('');
                    }}
                    variant="secondary"
                    disabled={createMutation.isPending}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePlaylist}
                    disabled={!newPlaylistTitle.trim() || createMutation.isPending}
                    variant="primary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing.xs }}
                  >
                    {createMutation.isPending && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                    Create
                  </Button>
                </HStack>
              </VStack>
            </VStack>
          </Card>
        </div>
      )}
    </Container>
  );
};

export default PlaylistsPage;
