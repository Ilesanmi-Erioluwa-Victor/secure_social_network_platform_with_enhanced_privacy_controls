import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/endpoints';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch (e) {}
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/feed" className="text-xl font-bold text-blue-600">SecureConnect</Link>
              <Link to="/feed" className="text-gray-700 hover:text-blue-600">Feed</Link>
              <Link to="/messages" className="text-gray-700 hover:text-blue-600">Messages</Link>
              {(user?.role === 'admin' || user?.role === 'moderator') && (
                <Link to="/admin" className="text-gray-700 hover:text-blue-600">Admin</Link>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/privacy" className="text-gray-700 hover:text-blue-600">Privacy</Link>
              <Link to={`/profile/${user?.username}`} className="text-gray-700 hover:text-blue-600">
                {user?.name}
              </Link>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Logout</button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
