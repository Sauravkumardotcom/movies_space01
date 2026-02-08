import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, FileAudio, Loader } from 'lucide-react';
import UploadCard from '../components/UploadCard';
import { SkeletonLoader } from '../components/Loading';
import { ErrorDisplay as ErrorState } from '../components/ErrorState';
import {
  useUserUploads,
  useCreateUpload,
  useDeleteUpload,
  useUploadStats,
} from '../hooks/useMusic';

const UploadsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  const { data: uploadsData, isLoading, error } = useUserUploads(page, 20);
  const { data: statsData } = useUploadStats();
  const createMutation = useCreateUpload();
  const deleteMutation = useDeleteUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploads = uploadsData?.data || [];
  const pagination = uploadsData?.pagination;
  const stats = statsData;

  const ALLOWED_TYPES = [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/flac',
  ];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`);
      return;
    }

    // Validate file size (500MB limit)
    const MAX_SIZE = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert(`File too large. Maximum: ${(MAX_SIZE / 1024 / 1024).toFixed(0)}MB`);
      return;
    }

    setIsUploading(true);
    try {
      // Get audio duration
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = async () => {
        try {
          // Create upload record
          await createMutation.mutateAsync({
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            duration: Math.round(audio.duration),
            fileSize: file.size,
            mimeType: file.type,
          });

          // Store file metadata (title, duration, size)
          // In production: Upload file to S3, extract audio metadata, update status
          // For now: Backend processes file upload and stores reference
          // TODO: Implement S3 integration for production deployment
          // TODO: Add audio metadata extraction (ID3 tags, waveform)

          alert('Upload successful! Your audio is now available.');
        } catch (error) {
          console.error('Failed to create upload:', error);
          alert('Failed to create upload');
        } finally {
          setIsUploading(false);
          URL.revokeObjectURL(audio.src);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file');
      setIsUploading(false);
    }
  };

  const handleDeleteUpload = async (id: string) => {
    if (!confirm('Are you sure you want to delete this upload?')) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete upload:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <UploadIcon size={32} className="text-blue-500" />
          <h1 className="text-3xl font-bold text-white">My Uploads</h1>
        </div>
        <p className="text-slate-400">Upload and manage your own audio files</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 space-y-1">
            <p className="text-slate-400 text-sm">Total Uploads</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 space-y-1">
            <p className="text-slate-400 text-sm">Processing</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.processing}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 space-y-1">
            <p className="text-slate-400 text-sm">Ready</p>
            <p className="text-2xl font-bold text-green-400">{stats.ready}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 space-y-1">
            <p className="text-slate-400 text-sm">Storage Used</p>
            <p className="text-2xl font-bold text-white">{stats.totalSizeMB}MB</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center space-y-4 hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex justify-center">
          <FileAudio size={48} className="text-slate-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Upload Audio Files</h3>
          <p className="text-slate-400 text-sm mb-3">
            Drag and drop your audio files or click to browse
          </p>
          <p className="text-slate-500 text-xs">
            Supported: MP3, WAV, OGG, MP4, FLAC • Max 500MB per file
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={isUploading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded transition-colors flex items-center gap-2 mx-auto"
        >
          {isUploading && <Loader size={16} className="animate-spin" />}
          {isUploading ? 'Processing...' : 'Select File'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
      />

      {/* Uploads List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Recent Uploads</h2>

        {isLoading ? (
          <Loading.LoadingSpinner />
        ) : error ? (
          <ErrorState.ErrorDisplay message="Failed to load uploads" />
        ) : uploads.length === 0 ? (
          <ErrorState.EmptyState
            title="No uploads yet"
            action={{
              label: 'Upload your first track',
              onClick: () => fileInputRef.current?.click(),
            }}
          />
        ) : (
          <>
            <div className="space-y-3">
              {uploads.map((upload) => (
                <UploadCard
                  key={upload.id}
                  upload={upload}
                  onDelete={handleDeleteUpload}
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
    </div>
  );
};

export default UploadsPage;
