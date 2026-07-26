import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { friendsAPI } from '../services/endpoints';
import useAuthStore from '../store/authStore';

export default function FriendRequests() {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(s => s.user);

  const loadRequests = useCallback(async () => {
    try {
      const { data } = await friendsAPI.getRequests();
      setReceived(data.received);
      setSent(data.sent);
    } catch (err) {
      console.error('Load requests error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const handleRespond = async (requestId, status) => {
    try {
      await friendsAPI.respondToRequest(requestId, { status });
      setReceived(prev => prev.filter(r => r._id !== requestId));
    } catch (err) {
      console.error('Respond error:', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Friend Requests</h1>

      <div className="space-y-4 mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Received ({received.length})
        </h2>
        {received.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <p className="text-gray-400">No pending friend requests</p>
          </div>
        )}
        {received.map(req => (
          <div key={req._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 card-hover flex items-center justify-between">
            <Link to={`/profile/${req.requester?.username}`} className="flex items-center space-x-3 group">
              <div className="w-12 h-12 avatar-placeholder rounded-full text-sm" style={{background: 'linear-gradient(135deg, #2563eb, #7c3aed)'}}>
                {req.requester?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{req.requester?.name}</p>
                <p className="text-sm text-gray-400">@{req.requester?.username}</p>
              </div>
            </Link>
            <div className="flex space-x-2">
              <button onClick={() => handleRespond(req._id, 'accepted')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all">Accept</button>
              <button onClick={() => handleRespond(req._id, 'rejected')}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">Decline</button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Sent ({sent.filter(s => s.status === 'pending').length})
        </h2>
        {sent.filter(s => s.status === 'pending').length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <p className="text-gray-400">No pending sent requests</p>
          </div>
        )}
        {sent.filter(s => s.status === 'pending').map(req => (
          <div key={req._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 card-hover flex items-center justify-between">
            <Link to={`/profile/${req.recipient?.username}`} className="flex items-center space-x-3 group">
              <div className="w-12 h-12 avatar-placeholder rounded-full text-sm" style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>
                {req.recipient?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{req.recipient?.name}</p>
                <p className="text-sm text-gray-400">@{req.recipient?.username}</p>
              </div>
            </Link>
            <span className="badge bg-yellow-50 text-yellow-700 px-3 py-1.5">⏳ Pending</span>
          </div>
        ))}
      </div>
    </div>
  );
}
