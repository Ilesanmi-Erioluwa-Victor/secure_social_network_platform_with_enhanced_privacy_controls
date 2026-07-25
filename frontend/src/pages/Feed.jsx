import { useState, useEffect, useCallback } from 'react';
import { postsAPI, usersAPI } from '../services/endpoints';
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
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data.comment],
      }));
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Feed</h1>

      <form onSubmit={handleCreatePost} className="bg-white rounded-lg shadow-md p-4 mb-6">
        <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?" rows={3}
          className="w-full px-3 py-2 border rounded-lg mb-3 resize-none" />
        <div className="flex items-center justify-between">
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)}
            className="border rounded-lg px-3 py-1 text-sm">
            <option value="public">Public</option>
            <option value="friends">Friends Only</option>
            <option value="only_me">Only Me</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Post
          </button>
        </div>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </form>

      {posts.map(post => (
        <div key={post._id} className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center mr-3">
              {post.author?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{post.author?.name}</p>
              <p className="text-xs text-gray-500">
                @{post.author?.username} · {new Date(post.createdAt).toLocaleDateString()}
                <span className="ml-2 text-blue-500">{post.visibility}</span>
              </p>
            </div>
          </div>
          <p className="mb-3 whitespace-pre-wrap">{post.content}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500 border-t pt-3">
            <button onClick={() => handleLike(post._id)}
              className={`hover:text-blue-600 ${post.likes?.includes(user?._id) ? 'text-blue-600' : ''}`}>
              {post.likes?.includes(user?._id) ? '❤️' : '🤍'} {post.likes?.length || 0}
            </button>
            <button onClick={() => toggleComments(post._id)} className="hover:text-blue-600">
              💬 {post.commentsCount || 0}
            </button>
          </div>
          {showComments[post._id] && (
            <div className="border-t mt-3 pt-3">
              {comments[post._id]?.map(comment => (
                <div key={comment._id} className="flex items-start mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2 text-sm">
                    {comment.author?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm"><span className="font-semibold">{comment.author?.name}</span> {comment.content}</p>
                    <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              <div className="flex mt-2">
                <input type="text" value={commentText[post._id] || ''}
                  onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                  placeholder="Write a comment..." className="flex-1 px-3 py-1 border rounded-l-lg text-sm" />
                <button onClick={() => handleAddComment(post._id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-r-lg text-sm">Post</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {hasMore && (
        <button onClick={() => { setPage(p => p + 1); loadPosts(page + 1); }}
          disabled={loading}
          className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 mb-8">
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
