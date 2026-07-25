import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/endpoints';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword({ email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-gray-500 mt-2">We'll send you a reset link</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-blue-100 p-8">
          {message && (
            <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{message}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input-field" placeholder="you@example.com" required />
            </div>
            {error && <p className="text-red-500 mb-4 text-sm bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">{error}</p>}
            <button type="submit" disabled={loading}
              className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Link'}
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
