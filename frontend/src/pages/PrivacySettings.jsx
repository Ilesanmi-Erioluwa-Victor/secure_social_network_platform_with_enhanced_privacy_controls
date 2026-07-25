import { useState, useEffect } from 'react';
import { usersAPI, authAPI } from '../services/endpoints';
import useAuthStore from '../store/authStore';

export default function PrivacySettings() {
  const user = useAuthStore(s => s.user);
  const [settings, setSettings] = useState({
    friendRequestWho: 'everyone',
    showFriendsList: 'everyone',
    showEmail: 'only_me',
  });
  const [message, setMessage] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaQrUrl, setMfaQrUrl] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockUserInput, setBlockUserInput] = useState('');

  useEffect(() => {
    if (user?.privacySettings) {
      setSettings(user.privacySettings);
    }
    usersAPI.getBlockedUsers()
      .then(({ data }) => setBlockedUsers(data.blockedUsers))
      .catch(console.error);
  }, [user]);

  const handleSave = async () => {
    try {
      await usersAPI.updatePrivacySettings(settings);
      setMessage('Privacy settings updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update settings');
    }
  };

  const handleBlock = async () => {
    if (!blockUserInput) return;
    try {
      await usersAPI.blockUser(blockUserInput);
      const { data } = await usersAPI.getBlockedUsers();
      setBlockedUsers(data.blockedUsers);
      setBlockUserInput('');
    } catch (err) {
      setMessage('Failed to block user');
    }
  };

  const handleUnblock = async (id) => {
    try {
      await usersAPI.unblockUser(id);
      const { data } = await usersAPI.getBlockedUsers();
      setBlockedUsers(data.blockedUsers);
    } catch (err) {
      setMessage('Failed to unblock user');
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
    } catch (err) {
      setMessage('Failed to download data');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) return;
    try {
      await usersAPI.deleteAccount();
      useAuthStore.getState().logout();
      window.location.href = '/login';
    } catch (err) {
      setMessage('Failed to delete account');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Privacy Settings</h1>

      {message && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{message}</div>}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile Privacy</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Who can send you friend requests?</label>
            <select value={settings.friendRequestWho}
              onChange={e => setSettings({ ...settings, friendRequestWho: e.target.value })}
              className="w-full border rounded-lg px-3 py-2">
              <option value="everyone">Everyone</option>
              <option value="friends_of_friends">Friends of Friends</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Who can see your friends list?</label>
            <select value={settings.showFriendsList}
              onChange={e => setSettings({ ...settings, showFriendsList: e.target.value })}
              className="w-full border rounded-lg px-3 py-2">
              <option value="everyone">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="only_me">Only Me</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Who can see your email?</label>
            <select value={settings.showEmail}
              onChange={e => setSettings({ ...settings, showEmail: e.target.value })}
              className="w-full border rounded-lg px-3 py-2">
              <option value="everyone">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="only_me">Only Me</option>
            </select>
          </div>
          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Save Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Blocked Users</h2>
        <div className="flex mb-3">
          <input type="text" value={blockUserInput}
            onChange={e => setBlockUserInput(e.target.value)}
            placeholder="Enter User ID to block" className="flex-1 px-3 py-2 border rounded-l-lg" />
          <button onClick={handleBlock}
            className="bg-red-600 text-white px-4 py-2 rounded-r-lg hover:bg-red-700">Block</button>
        </div>
        {blockedUsers.map(u => (
          <div key={u._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-gray-500">@{u.username}</p>
            </div>
            <button onClick={() => handleUnblock(u._id)}
              className="text-blue-600 hover:underline text-sm">Unblock</button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Data & Account</h2>
        <div className="space-y-4">
          <button onClick={handleDownloadData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full">
            Download My Data
          </button>
          <button onClick={handleDeleteAccount}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 w-full">
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}
