import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI, postsAPI, friendsAPI } from '../services/endpoints';
import useAuthStore from '../store/authStore';

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore(s => s.user);
  const isOwnProfile = !username || currentUser?.username === username;
  const targetUsername = username || currentUser?.username;

  useEffect(() => {
    if (!targetUsername) return;
    setLoading(true);
    Promise.all([
      usersAPI.getProfile(targetUsername),
      usersAPI.getProfile(targetUsername).then(({ data }) => {
        setFriendshipStatus(data.friendshipStatus);
        return data.user;
      }),
    ]).then(([profileRes]) => {
      const userData = profileRes.data.user;
      setProfile(userData);
      setEditForm({ name: userData.name, bio: userData.bio || '' });
      if (userData._id) {
        return postsAPI.getUserPosts(userData._id);
      }
    }).then((postsRes) => {
      if (postsRes) setPosts(postsRes.data.posts);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, [targetUsername]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await usersAPI.updateProfile(editForm);
      setProfile(data.user);
      setEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await friendsAPI.sendRequest(profile._id);
      setFriendshipStatus('requested');
    } catch (err) {
      console.error('Friend request failed:', err);
    }
  };

  const handleUnfriend = async () => {
    try {
      await friendsAPI.unfriend(profile._id);
      setFriendshipStatus('not_friends');
    } catch (err) {
      console.error('Unfriend failed:', err);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!profile) return <div className="text-center py-8">User not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start">
          <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center text-2xl font-bold mr-4">
            {profile.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-gray-500">@{profile.username}</p>
              </div>
              {!isOwnProfile && (
                <div className="space-x-2">
                  {friendshipStatus === 'not_friends' && (
                    <button onClick={handleSendFriendRequest}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Add Friend
                    </button>
                  )}
                  {friendshipStatus === 'requested' && (
                    <span className="text-gray-500">Request Sent</span>
                  )}
                  {friendshipStatus === 'friends' && (
                    <button onClick={handleUnfriend}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                      Unfriend
                    </button>
                  )}
                </div>
              )}
            </div>
            {editing && isOwnProfile ? (
              <form onSubmit={handleUpdateProfile} className="mt-4">
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg mb-2" placeholder="Name" />
                <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg mb-2" placeholder="Bio" rows={3} />
                <div className="flex space-x-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded-lg">Save</button>
                  <button type="button" onClick={() => setEditing(false)}
                    className="bg-gray-300 px-4 py-1 rounded-lg">Cancel</button>
                </div>
              </form>
            ) : (
              <p className="text-gray-600 mt-2">{profile.bio || 'No bio yet'}</p>
            )}
            {isOwnProfile && !editing && (
              <button onClick={() => setEditing(true)}
                className="text-blue-600 hover:underline text-sm mt-2">Edit Profile</button>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Posts</h2>
      {posts.map(post => (
        <div key={post._id} className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}
              <span className="ml-2 text-blue-500">{post.visibility}</span>
            </p>
          </div>
          <p className="whitespace-pre-wrap">{post.content}</p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <span>❤️ {post.likes?.length || 0}</span>
            <span className="ml-3">💬 {post.commentsCount || 0}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
