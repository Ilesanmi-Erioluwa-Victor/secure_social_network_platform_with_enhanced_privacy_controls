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
    usersAPI.getProfile(targetUsername)
      .then(({ data }) => {
        const userData = data.user;
        setProfile(userData);
        setFriendshipStatus(data.friendshipStatus);
        setEditForm({ name: userData.name, bio: userData.bio || '' });
        if (userData._id) {
          return postsAPI.getUserPosts(userData._id);
        }
      })
      .then((postsRes) => {
        if (postsRes) setPosts(postsRes.data.posts);
      })
      .catch(console.error)
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

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="spinner"></div>
    </div>
  );
  if (!profile) return <div className="text-center py-20 text-gray-500">User not found</div>;

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="gradient-bg h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-white"
                style={{background: 'linear-gradient(135deg, #2563eb, #7c3aed)'}}>
                {getInitials(profile.name)}
              </div>
            )}
            <div className="ml-4 mb-1 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-gray-500">@{profile.username}</p>
                </div>
                {!isOwnProfile && (
                  <div className="flex space-x-2">
                    {friendshipStatus === 'not_friends' && (
                      <button onClick={handleSendFriendRequest} className="btn-primary text-sm">
                        <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Add Friend
                      </button>
                    )}
                    {friendshipStatus === 'requested' && (
                      <span className="badge bg-yellow-50 text-yellow-700 px-4 py-2">⏳ Request Sent</span>
                    )}
                    {friendshipStatus === 'pending_approval' && (
                      <span className="badge bg-blue-50 text-blue-700 px-4 py-2">📩 Pending Approval</span>
                    )}
                    {friendshipStatus === 'friends' && (
                      <div className="flex space-x-2">
                        <Link to={`/messages/${profile._id}`} className="btn-primary text-sm">
                          💬 Message
                        </Link>
                        <button onClick={handleUnfriend} className="px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-all">
                          Unfriend
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {editing && isOwnProfile ? (
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className="input-field" placeholder="Name" />
              <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                className="input-field" placeholder="Bio" rows={3} />
              <div className="flex space-x-2">
                <button type="submit" className="btn-primary text-sm">Save Changes</button>
                <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          ) : (
            <div>
              <p className="text-gray-700 leading-relaxed">{profile.bio || 'No bio yet'}</p>
              {isOwnProfile && (
                <button onClick={() => setEditing(true)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <span>Posts</span>
        <span className="text-gray-400 font-normal">({posts.length})</span>
      </h2>

      {posts.map(post => (
        <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className={`badge ${
              post.visibility === 'public' ? 'bg-green-50 text-green-700' :
              post.visibility === 'friends' ? 'bg-blue-50 text-blue-700' :
              post.visibility === 'only_me' ? 'bg-gray-100 text-gray-600' : 'bg-purple-50 text-purple-700'
            }`}>
              {post.visibility === 'public' ? '🌍 Public' : post.visibility === 'friends' ? '👥 Friends' : post.visibility === 'only_me' ? '🔒 Only Me' : '🎯 Custom'}
            </span>
          </div>
          <Link to={`/post/${post._id}`} className="block">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            {post.mediaUrls?.length > 0 && (
              <div className={`grid gap-2 mt-3 ${post.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {post.mediaUrls.map((url, i) => (
                  url.match(/\.(mp4|webm)$/i)
                    ? <video key={i} src={url} controls className="w-full rounded-xl max-h-96 object-cover" />
                    : <img key={i} src={url} alt="Post media" className="w-full rounded-xl max-h-96 object-cover" loading="lazy" />
                ))}
              </div>
            )}
          </Link>
          <div className="flex items-center mt-3 text-sm text-gray-400 space-x-4 border-t border-gray-50 pt-3">
            <span>❤️ {post.likes?.length || 0}</span>
            <span>💬 {post.commentsCount || 0}</span>
          </div>
        </div>
      ))}
      {posts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400">No posts yet</p>
        </div>
      )}
    </div>
  );
}
