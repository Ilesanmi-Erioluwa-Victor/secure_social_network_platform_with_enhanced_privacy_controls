import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI, postsAPI, friendsAPI, uploadAPI } from '../services/endpoints';
import useAuthStore from '../store/authStore';

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [unfriending, setUnfriending] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const photoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const currentUser = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
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
    setSavingProfile(true);
    try {
      const { data } = await usersAPI.updateProfile(editForm);
      setProfile(data.user);
      setEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoUpload = async (type) => {
    const inputRef = type === 'avatar' ? photoInputRef : coverInputRef;
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    const setLoadingState = type === 'avatar' ? setUploadingPhoto : setUploadingCover;
    setLoadingState(true);
    try {
      const { data } = await uploadAPI.uploadFile(file);
      const field = type === 'avatar' ? 'avatarUrl' : 'coverUrl';
      const { data: updated } = await usersAPI.updateProfile({ [field]: data.url });
      setProfile(updated.user);
      if (currentUser?._id === updated.user._id) {
        setUser({ ...currentUser, ...updated.user });
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
    } finally {
      setLoadingState(false);
      inputRef.current.value = '';
    }
  };

  const handleSendFriendRequest = async () => {
    setSendingRequest(true);
    try {
      await friendsAPI.sendRequest(profile._id);
      setFriendshipStatus('requested');
    } catch (err) {
      console.error('Friend request failed:', err);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleUnfriend = async () => {
    setUnfriending(true);
    try {
      await friendsAPI.unfriend(profile._id);
      setFriendshipStatus('not_friends');
    } catch (err) {
      console.error('Unfriend failed:', err);
    } finally {
      setUnfriending(false);
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
        <div className="relative">
          {profile.coverUrl ? (
            <img src={profile.coverUrl} alt="Cover" className="w-full h-32 object-cover" />
          ) : (
            <div className="gradient-bg h-32"></div>
          )}
          {isOwnProfile && (
            <>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                onChange={() => handlePhotoUpload('cover')} />
              <button onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}
                className="absolute top-2 right-2 px-3 py-1.5 bg-black/40 backdrop-blur text-white text-xs font-medium rounded-xl hover:bg-black/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 transition-all">
                {uploadingCover ? (
                  <span className="spinner w-3.5 h-3.5 border-white border-t-transparent"></span>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                <span>{uploadingCover ? 'Uploading...' : 'Edit Cover'}</span>
              </button>
            </>
          )}
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            <div className="relative">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-white"
                  style={{background: 'linear-gradient(135deg, #2563eb, #7c3aed)'}}>
                  {getInitials(profile.name)}
                </div>
              )}
              {isOwnProfile && (
                <>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
                    onChange={() => handlePhotoUpload('avatar')} />
                  <button onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all">
                    {uploadingPhoto ? (
                      <span className="spinner w-4 h-4 border-white border-t-transparent"></span>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    )}
                  </button>
                </>
              )}
            </div>
            <div className="ml-4 mb-1 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-gray-500">@{profile.username}</p>
                </div>
                {!isOwnProfile && (
                  <div className="flex space-x-2">
                    {friendshipStatus === 'not_friends' && (
                      <button onClick={handleSendFriendRequest} disabled={sendingRequest}
                        className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        {sendingRequest ? (
                          <span className="flex items-center space-x-1.5">
                            <span className="spinner w-4 h-4 border-white border-t-transparent"></span>
                            <span>Sending...</span>
                          </span>
                        ) : (
                          <>
                            <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Add Friend
                          </>
                        )}
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
                        <button onClick={handleUnfriend} disabled={unfriending}
                          className="px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          {unfriending ? 'Unfriending...' : 'Unfriend'}
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
                <button type="submit" disabled={savingProfile}
                  className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditing(false)} disabled={savingProfile} className="btn-secondary text-sm">Cancel</button>
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
