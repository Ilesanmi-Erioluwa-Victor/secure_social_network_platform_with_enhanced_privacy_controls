import { useState, useEffect } from 'react';
import { usersAPI } from '../services/endpoints';
import useAuthStore from '../store/authStore';

export default function PrivacySettings() {
  const user = useAuthStore(s => s.user);
  const [settings, setSettings] = useState({
    friendRequestWho: 'everyone', showFriendsList: 'everyone', showEmail: 'only_me',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockUserInput, setBlockUserInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user?.privacySettings) setSettings(user.privacySettings);
    usersAPI.getBlockedUsers()
      .then(({ data }) => setBlockedUsers(data.blockedUsers))
      .catch(console.error);
  }, [user]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSave = async () => {
    try {
      await usersAPI.updatePrivacySettings(settings);
      showMessage('Privacy settings saved successfully');
    } catch (err) {
      showMessage('Failed to save settings', 'error');
    }
  };

  const handleBlock = async () => {
    if (!blockUserInput) return;
    try {
      await usersAPI.blockUser(blockUserInput);
      const { data } = await usersAPI.getBlockedUsers();
      setBlockedUsers(data.blockedUsers);
      setBlockUserInput('');
      showMessage('User blocked');
    } catch (err) {
      showMessage('Failed to block user', 'error');
    }
  };

  const handleUnblock = async (id) => {
    try {
      await usersAPI.unblockUser(id);
      const { data } = await usersAPI.getBlockedUsers();
      setBlockedUsers(data.blockedUsers);
      showMessage('User unblocked');
    } catch (err) {
      showMessage('Failed to unblock user', 'error');
    }
  };

  const handleDownloadData = async () => {
    try {
      const { data } = await usersAPI.downloadData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'secureconnect-data.json';
      a.click();
      URL.revokeObjectURL(url);
      showMessage('Your data has been downloaded');
    } catch (err) {
      showMessage('Failed to download data', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await usersAPI.deleteAccount();
      useAuthStore.getState().logout();
      window.location.href = '/login';
    } catch (err) {
      showMessage('Failed to delete account', 'error');
    }
  };

  const SettingCard = ({ icon, title, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
        <span>{icon}</span>
        <span>{title}</span>
      </h2>
      {children}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Privacy Settings</h1>
        <span className="text-sm text-gray-400">🔒 Your data, your control</span>
      </div>

      {message && (
        <div className={`mb-4 px-5 py-3 rounded-xl border text-sm font-medium ${
          messageType === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          {message}
        </div>
      )}

      <SettingCard icon="👤" title="Profile Privacy">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Who can send you friend requests?</label>
            <select value={settings.friendRequestWho}
              onChange={e => setSettings({ ...settings, friendRequestWho: e.target.value })}
              className="input-field">
              <option value="everyone">Everyone</option>
              <option value="friends_of_friends">Friends of Friends</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Who can see your friends list?</label>
            <select value={settings.showFriendsList}
              onChange={e => setSettings({ ...settings, showFriendsList: e.target.value })}
              className="input-field">
              <option value="everyone">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="only_me">Only Me</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Who can see your email?</label>
            <select value={settings.showEmail}
              onChange={e => setSettings({ ...settings, showEmail: e.target.value })}
              className="input-field">
              <option value="everyone">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="only_me">Only Me</option>
            </select>
          </div>
          <button onClick={handleSave} className="btn-primary">Save Settings</button>
        </div>
      </SettingCard>

      <SettingCard icon="🚫" title="Blocked Users">
        <p className="text-sm text-gray-500 mb-4">Blocked users cannot view your profile, posts, or send you messages.</p>
        <div className="flex mb-4">
          <input type="text" value={blockUserInput}
            onChange={e => setBlockUserInput(e.target.value)}
            placeholder="Enter username to block"
            className="flex-1 input-field rounded-r-none border-r-0"
            onKeyDown={(e) => { if (e.key === 'Enter') handleBlock(); }} />
          <button onClick={handleBlock}
            className="px-5 py-3 bg-red-500 text-white rounded-r-xl hover:bg-red-600 transition-all font-medium">Block</button>
        </div>
        {blockedUsers.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">No blocked users</p>
        ) : (
          <div className="space-y-2">
            {blockedUsers.map(u => (
              <div key={u._id} className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 avatar-placeholder text-xs rounded-xl" style={{background: 'linear-gradient(135deg, #ef4444, #dc2626)'}}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                  </div>
                </div>
                <button onClick={() => handleUnblock(u._id)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium">Unblock</button>
              </div>
            ))}
          </div>
        )}
      </SettingCard>

      <SettingCard icon="📋" title="Data & Account">
        <div className="space-y-3">
          <button onClick={handleDownloadData}
            className="w-full py-3 px-5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all font-medium flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download My Data</span>
          </button>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 px-5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-medium flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete My Account</span>
            </button>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-sm text-red-700 font-medium mb-3">Are you sure? This action is permanent and cannot be undone.</p>
              <div className="flex space-x-2">
                <button onClick={handleDeleteAccount}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium text-sm">Yes, Delete</button>
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all font-medium text-sm">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </SettingCard>
    </div>
  );
}
