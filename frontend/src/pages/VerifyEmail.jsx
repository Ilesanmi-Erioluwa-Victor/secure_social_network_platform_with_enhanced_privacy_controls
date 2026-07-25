import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/endpoints';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('no-token');
      return;
    }

    authAPI.verifyEmail({ token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, []);

  const handleManualVerify = async (e) => {
    e.preventDefault();
    const token = e.target.token.value;
    try {
      await authAPI.verifyEmail({ token });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {status === 'verifying' && <p className="text-gray-600">Verifying your email...</p>}
        {status === 'success' && (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Email Verified!</h2>
            <p className="mb-4">Your email has been successfully verified.</p>
            <button onClick={() => navigate('/feed')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Go to Feed
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 className="text-xl font-bold text-red-600 mb-4">Verification Failed</h2>
            <p className="mb-4">The link may be expired or invalid.</p>
            <form onSubmit={handleManualVerify}>
              <input type="text" name="token" placeholder="Paste verification token"
                className="w-full px-3 py-2 border rounded-lg mb-4" />
              <button type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Try Again
              </button>
            </form>
          </>
        )}
        {status === 'no-token' && <p className="text-gray-600">No verification token provided.</p>}
      </div>
    </div>
  );
}
