import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/endpoints';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (!token) { setError('No reset token provided'); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword({ token, newPassword: password });
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
          <p className="text-gray-500 mt-2">Choose a strong password you haven't used before</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-blue-100 p-8">
          {message && (
            <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">{message}</div>
          )}
          {!token && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">Invalid or missing reset token.</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field" placeholder="Min. 8 chars" required minLength={8} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="input-field" placeholder="Repeat password" required />
              </div>
            </div>
            {error && <p className="text-red-500 mb-4 text-sm bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">{error}</p>}
            <button type="submit" disabled={loading || !token}
              className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p className="mt-6 text-center">
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium text-sm">← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
