import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/endpoints';
import useAuthStore from '../store/authStore';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const user = useAuthStore(s => s.user);

  const loadPosts = useCallback(async (pageNum = 1) => {
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await postsAPI.getFeed({ page: pageNum, limit: 20 });
      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      setHasMore(pageNum < data.pagination.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => { loadPosts(1); }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      const { data } = await postsAPI.createPost({ content: newPost, visibility });
      setPosts(prev => [data.post, ...prev]);
      setNewPost('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await postsAPI.likePost(postId);
      setPosts(prev => prev.map(p =>
        p._id === postId
          ? { ...p, likes: data.liked ? [...p.likes, user._id] : p.likes.filter(id => id !== user._id) }
          : p
      ));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;
    try {
      const { data } = await postsAPI.addComment(postId, { content: commentText[postId] });
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), data.comment] }));
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      setPosts(prev => prev.map(p =>
        p._id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      ));
    } catch (err) {
      console.error('Comment error:', err);
    }
  };

  const toggleComments = async (postId) => {
    if (showComments[postId]) {
      setShowComments(prev => ({ ...prev, [postId]: false }));
      return;
    }
    setShowComments(prev => ({ ...prev, [postId]: true }));
    try {
      const { data } = await postsAPI.getComments(postId);
      setComments(prev => ({ ...prev, [postId]: data.comments }));
    } catch (err) {
      console.error('Load comments error:', err);
    }
  };

  const visibilityLabels = { public: '🌍 Public', friends: '👥 Friends', custom: '🎯 Custom', only_me: '🔒 Only Me' };
  const visibilityColors = { public: 'bg-green-50 text-green-700', friends: 'bg-blue-50 text-blue-700', custom: 'bg-purple-50 text-purple-700', only_me: 'bg-gray-100 text-gray-600' };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
        <span className="text-sm text-gray-500">Welcome, {user?.name?.split(' ')[0]} 👋</span>
      </div>

      <form onSubmit={handleCreatePost} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 card-hover">
        <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?" rows={3}
          className="w-full px-0 py-2 border-0 border-b border-gray-100 focus:ring-0 focus:border-blue-400 resize-none text-gray-700 placeholder-gray-400 mb-4" />
        <div className="flex items-center justify-between">
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
            <option value="public">🌍 Public</option>
            <option value="friends">👥 Friends Only</option>
            <option value="only_me">🔒 Only Me</option>
          </select>
          <button type="submit" className="btn-primary text-sm">
            <svg className="w-4 h-4 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Post
          </button>
        </div>
        {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
      </form>

      {posts.map(post => (
        <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 card-hover">
          <div className="flex items-center mb-4">
            <Link to={`/profile/${post.author?.username}`} className="flex items-center space-x-3 group">
              <div className="w-11 h-11 avatar-placeholder text-sm rounded-full" style={{background: 'linear-gradient(135deg, #2563eb, #7c3aed)'}}>
                {post.author?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{post.author?.name}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span>@{post.author?.username}</span>
                  <span>·</span>
                  <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </Link>
            <span className={`ml-auto badge ${visibilityColors[post.visibility] || 'bg-gray-100 text-gray-600'}`}>
              {visibilityLabels[post.visibility] || post.visibility}
            </span>
          </div>
          <p className="text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
          <div className="flex items-center space-x-1 text-sm border-t border-gray-50 pt-3">
            <button onClick={() => handleLike(post._id)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                post.likes?.includes(user?._id)
                  ? 'text-red-500 bg-red-50 hover:bg-red-100'
                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
              }`}>
              <span>{post.likes?.includes(user?._id) ? '❤️' : '🤍'}</span>
              <span className="font-medium">{post.likes?.length || 0}</span>
            </button>
            <button onClick={() => toggleComments(post._id)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                showComments[post._id] ? 'text-blue-500 bg-blue-50' : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
              }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium">{post.commentsCount || 0}</span>
            </button>
          </div>

          {showComments[post._id] && (
            <div className="border-t border-gray-100 mt-3 pt-4">
              {(!comments[post._id] || comments[post._id].length === 0) && (
                <p className="text-gray-400 text-sm text-center py-3">No comments yet. Be the first!</p>
              )}
              {comments[post._id]?.map(comment => (
                <div key={comment._id} className="flex items-start space-x-3 mb-3">
                  <div className="w-8 h-8 avatar-placeholder text-xs rounded-full shrink-0" style={{background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'}}>
                    {comment.author?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-2.5">
                    <div className="flex items-center justify-between">
                      <Link to={`/profile/${comment.author?.username}`} className="text-sm font-semibold text-gray-900 hover:text-blue-600">
                        {comment.author?.name}
                      </Link>
                      <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center space-x-2 mt-3">
                <div className="w-8 h-8 avatar-placeholder text-xs rounded-full shrink-0" style={{background: 'linear-gradient(135deg, #2563eb, #7c3aed)'}}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <input type="text" value={commentText[post._id] || ''}
                  onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post._id); }} />
                <button onClick={() => handleAddComment(post._id)}
                  className="btn-primary text-sm px-4 py-2.5">Send</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {hasMore && (
        <button onClick={() => { setPage(p => p + 1); loadPosts(page + 1); }}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium">
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <span className="spinner w-5 h-5"></span>
              <span>Loading more posts...</span>
            </span>
          ) : (
            <span>↓ Load More Posts</span>
          )}
        </button>
      )}
    </div>
  );
}
