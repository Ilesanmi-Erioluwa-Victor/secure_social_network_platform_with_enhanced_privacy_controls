import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/endpoints';
import { generateKeypair, storePrivateKey } from '../utils/crypto';

export default function Register() {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      let publicKey = '';
      try {
        const kp = await generateKeypair();
        publicKey = kp.publicKey;
        await storePrivateKey(kp.privateKey);
      } catch (cryptoErr) {
        console.warn('Crypto init failed, proceeding without E2E keys:', cryptoErr);
      }

      const { data } = await authAPI.register({
        name: form.name, username: form.username, email: form.email,
        password: form.password, publicKey,
      });

      localStorage.setItem('accessToken', data.accessToken);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Join SecureConnect</h1>
          <p className="text-gray-500 mt-2">Create your account with privacy-first features</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-blue-100 p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                className="input-field" placeholder="John Doe" required />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                <input type="text" name="username" value={form.username} onChange={handleChange}
                  className="input-field" placeholder="johndoe" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className="input-field" placeholder="john@example.com" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange}
                  className="input-field" placeholder="Min. 8 characters" required minLength={8} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                  className="input-field" placeholder="Repeat password" required />
              </div>
            </div>
            {error && <p className="text-red-500 mb-4 text-sm bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">{error}</p>}
            <button type="submit" disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="mt-6 text-center text-gray-500 text-sm">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <p className="mt-6 text-center text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
