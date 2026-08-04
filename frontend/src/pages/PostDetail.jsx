import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postsAPI } from '../services/endpoints';
import useAuthStore from '../store/authStore';

export default function PostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const { data } = await postsAPI.getPost(postId);
      setPost(data.post);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await postsAPI.likePost(postId);
      setPost(prev => ({
        ...prev,
        likes: data.liked ? [...prev.likes, user._id] : prev.likes.filter(id => id !== user._id),
      }));
    } catch (err) { console.error('Like error:', err); }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || sendingComment) return;
    setSendingComment(true);
    try {
      const { data } = await postsAPI.addComment(postId, { content: commentText });
      setComments(prev => [...prev, data.comment]);
      setCommentText('');
      setPost(prev => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
    } catch (err) { console.error('Comment error:', err); }
    finally { setSendingComment(false); }
  };

  const toggleComments = async () => {
    if (showComments) { setShowComments(false); return; }
    setShowComments(true);
    setLoadingComments(true);
    try {
      const { data } = await postsAPI.getComments(postId);
      setComments(data.comments);
    } catch (err) { console.error('Load comments error:', err); }
    finally { setLoadingComments(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="spinner"></div>
    </div>
  );
  if (error) return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-red-500 font-medium">{error}</p>
        <Link to="/feed" className="btn-primary inline-block mt-4">Back to Feed</Link>
      </div>
    </div>
  );
  if (!post) return null;

  const visibilityLabels = { public: '🌍 Public', friends: '👥 Friends', custom: '🎯 Custom', only_me: '🔒 Only Me' };
  const visibilityColors = { public: 'bg-green-50 text-green-700', friends: 'bg-blue-50 text-blue-700', custom: 'bg-purple-50 text-purple-700', only_me: 'bg-gray-100 text-gray-600' };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/feed" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition-colors">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Feed
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
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
                <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </Link>
          <span className={`ml-auto badge ${visibilityColors[post.visibility] || 'bg-gray-100 text-gray-600'}`}>
            {visibilityLabels[post.visibility] || post.visibility}
          </span>
        </div>

        <p className="text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap text-lg">{post.content}</p>

        {post.mediaUrls?.length > 0 && (
          <div className={`grid gap-2 mb-4 ${post.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.mediaUrls.map((url, i) => (
              url.match(/\.(mp4|webm)$/i)
                ? <video key={i} src={url} controls className="w-full rounded-xl max-h-96 object-cover" />
                : <img key={i} src={url} alt="Post media" className="w-full rounded-xl max-h-96 object-cover" loading="lazy" />
            ))}
          </div>
        )}

        <div className="flex items-center space-x-1 text-sm border-t border-gray-50 pt-3">
          <button onClick={handleLike}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all duration-200 ${
              post.likes?.includes(user?._id)
                ? 'text-red-500 bg-red-50 hover:bg-red-100'
                : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
            }`}>
            <span>{post.likes?.includes(user?._id) ? '❤️' : '🤍'}</span>
            <span className="font-medium">{post.likes?.length || 0}</span>
          </button>
          <button onClick={toggleComments}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all duration-200 ${
              showComments ? 'text-blue-500 bg-blue-50' : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
            }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium">{post.commentsCount || 0}</span>
          </button>
        </div>

        {showComments && (
          <div className="border-t border-gray-100 mt-3 pt-4">
            {loadingComments ? (
              <div className="flex items-center justify-center py-6 space-x-2 text-gray-400">
                <div className="spinner w-5 h-5"></div>
                <p className="text-sm">Loading comments...</p>
              </div>
            ) : (
              <>
                {comments.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-3">No comments yet. Be the first!</p>
                )}
                {comments.map(comment => (
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
              </>
            )}
            <div className="flex items-center space-x-2 mt-3">
              <div className="w-8 h-8 avatar-placeholder text-xs rounded-full shrink-0" style={{background: 'linear-gradient(135deg, #2563eb, #7c3aed)'}}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <input type="text" value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                disabled={sendingComment}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 disabled:opacity-50"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }} />
              <button onClick={handleAddComment}
                disabled={sendingComment || !commentText.trim()}
                className="btn-primary text-sm px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed min-w-[74px] flex justify-center">
                {sendingComment
                  ? <span className="spinner w-4 h-4 border-white border-t-transparent"></span>
                  : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
