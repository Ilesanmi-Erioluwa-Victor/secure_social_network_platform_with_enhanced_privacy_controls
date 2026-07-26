import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { messagesAPI, usersAPI } from '../services/endpoints';
import { getPrivateKey, encryptMessage, decryptMessage } from '../utils/crypto';
import useAuthStore from '../store/authStore';

export default function Conversation() {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [theirPublicKey, setTheirPublicKey] = useState(null);
  const [decryptedMessages, setDecryptedMessages] = useState({});
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    loadMessages();
    loadUserInfo();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, decryptedMessages]);

  const loadUserInfo = async () => {
    try {
      const { data } = await usersAPI.getProfile(userId);
      setOtherUser(data.user);
      setTheirPublicKey(data.user.publicKey);
    } catch (err) {
      console.error('Load user error:', err);
    }
  };

  const loadMessages = async () => {
    try {
      const { data } = await messagesAPI.getMessages(userId);
      setMessages(data.messages);
    } catch (err) {
      console.error('Load messages error:', err);
    }
  };

  const handleDecrypt = async (msg) => {
    if (!msg.sender?.publicKey) return msg.ciphertext;
    try {
      const privateKey = await getPrivateKey();
      if (!privateKey) return '🔒 Encrypted message';
      return await decryptMessage(msg.sender.publicKey, privateKey, msg.ciphertext, msg.nonce);
    } catch {
      return '🔒 Encrypted message';
    }
  };

  useEffect(() => {
    messages.forEach(async (msg) => {
      if (msg.nonce !== 'unencrypted' && !decryptedMessages[msg._id]) {
        const text = await handleDecrypt(msg);
        setDecryptedMessages(prev => ({ ...prev, [msg._id]: text }));
      }
    });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const privateKey = await getPrivateKey();
      if (privateKey && theirPublicKey) {
        const encrypted = await encryptMessage(theirPublicKey, privateKey, newMessage);
        await messagesAPI.sendMessage(userId, { ciphertext: encrypted.ciphertext, nonce: encrypted.nonce });
      } else {
        await messagesAPI.sendMessage(userId, { ciphertext: newMessage, nonce: 'unencrypted' });
      }
      setNewMessage('');
      loadMessages();
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          {otherUser ? (
            <Link to={`/profile/${otherUser.username}`} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>
                {otherUser.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{otherUser.name}</p>
                <p className="text-xs text-gray-400">@{otherUser.username}</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl shimmer"></div>
              <div className="space-y-2">
                <div className="w-32 h-4 shimmer rounded"></div>
                <div className="w-20 h-3 shimmer rounded"></div>
              </div>
            </div>
          )}
          <div className="badge bg-green-50 text-green-700">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1.5"></span>
            {theirPublicKey ? '🔒 E2EE Available' : 'Standard'}
          </div>
        </div>

        <div className="h-[500px] overflow-y-auto p-5 space-y-4 bg-gray-50/50">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">No messages yet. Say hello!</p>
              </div>
            </div>
          )}
          {messages.map(msg => {
            const isMine = msg.sender?._id === user?._id;
            const displayText = msg.nonce === 'unencrypted'
              ? msg.ciphertext
              : (decryptedMessages[msg._id] || '🔒 Encrypted');
            return (
              <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isMine ? 'order-1' : 'order-1'}`}>
                  <div className={`px-4 py-2.5 ${
                    isMine
                      ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
                      : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                  }`}>
                    <p className="text-sm leading-relaxed">{displayText}</p>
                  </div>
                  <p className={`text-xs mt-1 ${isMine ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.readAt && isMine && <span className="ml-1">✓✓</span>}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center space-x-2">
            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..." disabled={sending}
              className="flex-1 input-field py-3"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }} />
            <button type="submit" disabled={sending || !newMessage.trim()}
              className="btn-primary px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {sending ? (
                <span className="spinner w-5 h-5 border-white border-t-transparent"></span>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
