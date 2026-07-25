import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/endpoints';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      if (data.mfaRequired) {
        setTempToken(data.tempToken);
        setMfaRequired(true);
      } else {
        localStorage.setItem('accessToken', data.accessToken);
        setUser(data.user);
        navigate('/feed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.verifyMFA({ tempToken, mfaCode });
      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'MFA verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (mfaRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl shadow-blue-100 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
              <p className="text-gray-500 mt-2">Enter the code from your authenticator app</p>
            </div>
            <form onSubmit={handleMFAVerify}>
              <input type="text" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)}
                placeholder="000000" maxLength={6}
                className="input-field text-center text-3xl tracking-[0.5em] font-mono mb-4" autoFocus />
              {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
              <button type="submit" disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-2">Sign in to your SecureConnect account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-blue-100 p-8">
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field" placeholder="you@example.com" required />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" placeholder="Enter your password" required />
            </div>
            <div className="flex justify-end mb-6">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </Link>
            </div>
            {error && <p className="text-red-500 mb-4 text-sm bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">{error}</p>}
            <button type="submit" disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">Create one</Link>
        </p>

        <div className="mt-6 bg-blue-50 rounded-xl border border-blue-100 p-4">
          <p className="text-xs text-blue-700 font-medium mb-1">🔐 Demo Credentials</p>
          <p className="text-xs text-blue-600">Email: alice@example.com / Password: password123</p>
        </div>
      </div>
    </div>
  );
}
