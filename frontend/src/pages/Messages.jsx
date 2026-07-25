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

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      {conversations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No conversations yet</p>
          <p className="text-gray-400 text-sm mt-2">Go to a user's profile to send them a message</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => (
            <Link key={conv.user?._id} to={`/messages/${conv.user?._id}`}
              className="block bg-white rounded-lg shadow-sm p-4 hover:bg-gray-50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                  {conv.user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-semibold">{conv.user?.name}</p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
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
