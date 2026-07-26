import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import FriendRequests from './pages/FriendRequests';
import Messages from './pages/Messages';
import Conversation from './pages/Conversation';
import AdminDashboard from './pages/AdminDashboard';
import PrivacySettings from './pages/PrivacySettings';
import Layout from './components/Layout';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
}

function AdminRoute({ children }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin' && user?.role !== 'moderator') return <Navigate to="/feed" />;
  return children;
}

export default function App() {
  const { isAuthenticated, initAuth } = useAuthStore();

  useEffect(() => { initAuth(); }, []);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/feed" /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/feed" /> : <Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/feed" element={<Feed />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/requests" element={<FriendRequests />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:userId" element={<Conversation />} />
        <Route path="/privacy" element={<PrivacySettings />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/feed" />} />
    </Routes>
  );
}
