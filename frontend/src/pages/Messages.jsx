import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { messagesAPI } from '../services/endpoints';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messagesAPI.getConversations()
      .then(({ data }) => setConversations(data.conversations))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      {conversations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No conversations yet</p>
          <p className="text-gray-400 text-sm mt-1">Go to a user's profile to start a conversation</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => (
            <Link key={conv.user?._id} to={`/messages/${conv.user?._id}`}
              className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:bg-gray-50 transition-all card-hover">
              <div className="flex items-center">
                {conv.user?.avatarUrl ? (
                  <img src={conv.user.avatarUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0"
                    style={{background: 'linear-gradient(135deg, #2563eb, #7c3aed)'}}>
                    {conv.user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 truncate">{conv.user?.name}</p>
                    <div className="flex items-center space-x-2">
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-400">{new Date(conv.lastMessage.createdAt).toLocaleDateString()}</span>
                      )}
                      {conv.unreadCount > 0 && (
                        <span className="badge bg-blue-600 text-white min-w-[20px] h-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {conv.lastMessage?.ciphertext ? '🔒 Encrypted message' : ''}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
