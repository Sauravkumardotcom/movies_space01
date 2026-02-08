import { useState } from 'react';
import { useSearch, useTrendingMovies, useTrendingMusic, useRecommendations } from '../hooks/useSearch';
import SearchBar from '../components/search/SearchBar';
import { Loader, Flame, Sparkles } from 'lucide-react';

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<'trending' | 'movies' | 'music' | 'recommendations'>('trending');
  const [moviePage, setMoviePage] = useState(1);
  const [musicPage, setMusicPage] = useState(1);
  const [recPage, setRecPage] = useState(1);

  const { data: trendingMovies, isLoading: trendingMoviesLoading } = useTrendingMovies(moviePage);
  const { data: trendingMusic, isLoading: trendingMusicLoading } = useTrendingMusic(musicPage);
  const { data: recommendations, isLoading: recsLoading } = useRecommendations(recPage);

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-6">Discover</h1>
          <SearchBar />
        </div>

        <div className="flex gap-2 border-b border-gray-700">
          {(['trending', 'movies', 'music', 'recommendations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold transition ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'trending' && (
          <div className="space-y-8">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-white mb-4">
                <Flame className="w-6 h-6 text-red-500" />
                Trending Movies
              </h2>
              {trendingMoviesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trendingMovies?.data.map((movie) => (
                    <div
                      key={movie.id}
                      className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition cursor-pointer"
                    >
                      <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <div className="text-4xl text-gray-600">🎬</div>
                      </div>
                      <div className="p-3">
                        <p className="text-white font-semibold line-clamp-2">{movie.title}</p>
                        <p className="text-gray-400 text-sm">{movie.views} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {trendingMovies && trendingMovies.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => setMoviePage((p) => Math.max(1, p - 1))}
                    disabled={moviePage === 1}
                    className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
                  >
                    Previous
                  </button>
                  <span className="text-gray-400 py-2">
                    Page {moviePage} of {trendingMovies.totalPages}
                  </span>
                  <button
                    onClick={() => setMoviePage((p) => p + 1)}
                    disabled={moviePage === trendingMovies.totalPages}
                    className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-white mb-4">
                <Flame className="w-6 h-6 text-orange-500" />
                Trending Music
              </h2>
              {trendingMusicLoading ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trendingMusic?.data.map((music) => (
                    <div
                      key={music.id}
                      className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition cursor-pointer p-4"
                    >
                      <div className="text-4xl mb-3">🎵</div>
                      <p className="text-white font-semibold line-clamp-2">{music.title}</p>
                      <p className="text-gray-400 text-sm">{music.plays} plays</p>
                    </div>
                  ))}
                </div>
              )}
              {trendingMusic && trendingMusic.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => setMusicPage((p) => Math.max(1, p - 1))}
                    disabled={musicPage === 1}
                    className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
                  >
                    Previous
                  </button>
                  <span className="text-gray-400 py-2">
                    Page {musicPage} of {trendingMusic.totalPages}
                  </span>
                  <button
                    onClick={() => setMusicPage((p) => p + 1)}
                    disabled={musicPage === trendingMusic.totalPages}
                    className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'movies' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Movies Search Results</h2>
            <p className="text-gray-400 text-center py-12">Use the search bar above to find movies</p>
          </div>
        )}

        {activeTab === 'music' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Music Search Results</h2>
            <p className="text-gray-400 text-center py-12">Use the search bar above to find music</p>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white mb-4">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              Recommended For You
            </h2>
            {recsLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations?.data.map((rec) => (
                  <div
                    key={`${rec.id}-${rec.entityType}`}
                    className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition cursor-pointer"
                  >
                    <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <div className="text-4xl">
                        {rec.entityType === 'MOVIE' ? '🎬' : rec.entityType === 'MUSIC' ? '🎵' : '📱'}
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-white font-semibold line-clamp-2">{rec.title}</p>
                      <p className="text-gray-400 text-sm capitalize">{rec.entityType}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {recommendations && recommendations.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setRecPage((p) => Math.max(1, p - 1))}
                  disabled={recPage === 1}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
                >
                  Previous
                </button>
                <span className="text-gray-400 py-2">
                  Page {recPage} of {recommendations.totalPages}
                </span>
                <button
                  onClick={() => setRecPage((p) => p + 1)}
                  disabled={recPage === recommendations.totalPages}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
