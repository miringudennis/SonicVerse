import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { StoryPage } from './pages/StoryPage';
import { DiscoveryPage } from './pages/DiscoveryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SyncPage } from './pages/SyncPage';
import { SpotifyCallbackPage } from './pages/SpotifyCallbackPage';
import { SocialFeedPage } from './pages/SocialFeedPage';
import { CatalogPage } from './pages/CatalogPage';
import { WelcomePage } from './pages/WelcomePage';
import { SettingsPage } from './pages/SettingsPage';
import { MapPage } from './pages/MapPage';
import { ProtectedRoute } from './components/ProtectedRoute';

const Dashboard = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
    <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
      SonicVerse
    </h1>
    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
      The modular music platform for storytelling, discovery, and social creation.
    </p>
    <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/discover" className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition">
          Explore Discovery Graph
        </Link>
        <Link to="/catalog" className="px-8 py-3 bg-blue-600 font-bold rounded-full hover:bg-blue-700 transition">
          Explore Catalog
        </Link>
        <Link to="/story/demo" className="px-8 py-3 bg-gray-900 border border-gray-800 font-bold rounded-full hover:bg-gray-800 transition">
          View Interactive Story
        </Link>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<WelcomePage />} />
        
        {/* Auth Pages (Standalone) */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="sync/:platform" element={<SyncPage />} />
        <Route path="callback/spotify" element={<SpotifyCallbackPage />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="discover" element={<DiscoveryPage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="feed" element={<SocialFeedPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="story/:id" element={<StoryPage />} />
          </Route>
        </Route>

        {/* 404 handler */}
        <Route path="*" element={
          <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-20 text-center">
            <h2 className="text-3xl font-bold mb-4 font-black">404 - Verse Not Found</h2>
            <Link to="/" className="px-6 py-2 bg-blue-600 rounded-full font-bold">Return to SonicVerse</Link>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
