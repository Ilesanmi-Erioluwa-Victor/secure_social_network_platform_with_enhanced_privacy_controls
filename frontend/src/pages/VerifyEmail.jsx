import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/endpoints';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('no-token'); return; }
    authAPI.verifyEmail({ token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, []);

  const handleManualVerify = async (e) => {
    e.preventDefault();
    const token = e.target.token.value;
    setVerifying(true);
    try {
      await authAPI.verifyEmail({ token });
      setStatus('success');
    } catch { setStatus('error'); }
    finally { setVerifying(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-100 p-8 text-center">
          {status === 'verifying' && (
            <div>
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}
          {status === 'success' && (
            <div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Email Verified!</h2>
              <p className="text-gray-500 mb-6">Your email has been successfully verified.</p>
              <button onClick={() => navigate('/feed')} className="btn-primary">Go to Feed</button>
            </div>
          )}
          {status === 'error' && (
            <div>
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-600 mb-2">Verification Failed</h2>
              <p className="text-gray-500 mb-6">The link may be expired or invalid.</p>
              <form onSubmit={handleManualVerify}>
                <input type="text" name="token" placeholder="Paste verification token"
                  className="input-field mb-4" />
                <button type="submit" disabled={verifying}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                  {verifying ? 'Verifying...' : 'Try Again'}
                </button>
              </form>
            </div>
          )}
          {status === 'no-token' && (
            <div>
              <p className="text-gray-500">No verification token provided.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
