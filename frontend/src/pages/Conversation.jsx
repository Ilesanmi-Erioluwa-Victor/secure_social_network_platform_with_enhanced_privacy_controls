import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { messagesAPI, usersAPI } from '../services/endpoints';
import { getPrivateKey, encryptMessage, decryptMessage } from '../utils/crypto';

export default function Conversation() {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [myPublicKey, setMyPublicKey] = useState(null);
  const [theirPublicKey, setTheirPublicKey] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    loadUserInfo();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const privateKey = await getPrivateKey();
      if (privateKey && theirPublicKey) {
        const encrypted = await encryptMessage(theirPublicKey, privateKey, newMessage);
        await messagesAPI.sendMessage(userId, {
          ciphertext: encrypted.ciphertext,
          nonce: encrypted.nonce,
        });
      } else {
        await messagesAPI.sendMessage(userId, {
          ciphertext: newMessage,
          nonce: 'unencrypted',
        });
      }
      setNewMessage('');
      loadMessages();
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const handleDecrypt = async (msg) => {
    if (!msg.sender?.publicKey) return msg.ciphertext;
    try {
      const privateKey = await getPrivateKey();
      if (!privateKey) return '🔒 Encrypted message';
      const decrypted = await decryptMessage(
        msg.sender.publicKey, privateKey, msg.ciphertext, msg.nonce
      );
      return decrypted;
    } catch {
      return '🔒 Encrypted message';
    }
  };

  const [decryptedMessages, setDecryptedMessages] = useState({});

  useEffect(() => {
    messages.forEach(async (msg) => {
      if (msg.nonce !== 'unencrypted' && !decryptedMessages[msg._id]) {
        const text = await handleDecrypt(msg);
        setDecryptedMessages(prev => ({ ...prev, [msg._id]: text }));
      }
    });
  }, [messages]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">{otherUser?.name || 'Loading...'}</h2>
          <p className="text-sm text-gray-500">{otherUser && `@${otherUser.username}`}</p>
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => {
            const isMine = msg.sender?._id === localStorage.getItem('userId');
            const displayText = msg.nonce === 'unencrypted'
              ? msg.ciphertext
              : (decryptedMessages[msg._id] || '🔒 Decrypting...');
            return (
              <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${
                  isMine ? 'bg-blue-600 text-white' : 'bg-gray-100'
                }`}>
                  <p>{displayText}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t flex">
          <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..." className="flex-1 px-3 py-2 border rounded-l-lg" />
          <button type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
