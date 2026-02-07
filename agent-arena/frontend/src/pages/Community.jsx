import { useState, useEffect } from 'react';

const API_BASE = '';

export default function Community() {
    const [posts, setPosts] = useState([]);
    const [category, setCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [posting, setPosting] = useState(false);

    const categories = ['all', 'battle_review', 'balance_talk', 'tips', 'general'];

    useEffect(() => {
        fetchPosts();
    }, [category]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const url = category === 'all'
                ? `${API_BASE}/api/v2/posts`
                : `${API_BASE}/api/v2/posts?category=${category}`;
            const res = await fetch(url);
            const data = await res.json();
            setPosts(data.posts || []);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async () => {
        if (!newPostContent.trim()) {
            alert('Please enter some content');
            return;
        }

        setPosting(true);
        try {
            const res = await fetch(`${API_BASE}/api/v2/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author_id: 'demo_agent_1',
                    title: newPostContent.slice(0, 50),
                    content: newPostContent,
                    category: category === 'all' ? 'general' : category
                })
            });
            const data = await res.json();
            if (res.ok) {
                setNewPostContent('');
                fetchPosts(); // Refresh posts
            } else {
                alert(`❌ ${data.detail || 'Failed to post'}`);
            }
        } catch (error) {
            alert('❌ Failed to create post');
            console.error(error);
        } finally {
            setPosting(false);
        }
    };

    const handleReaction = async (postId, reactionType) => {
        try {
            const res = await fetch(`${API_BASE}/api/v2/posts/${postId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agent_id: 'demo_agent_1',
                    reaction: reactionType
                })
            });
            if (res.ok) {
                fetchPosts(); // Refresh to show updated counts
            }
        } catch (error) {
            console.error('Failed to react:', error);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">COMMUNITY HUB</h1>

            {/* Category Tabs */}
            <div className="flex gap-4 mb-6 border-b border-[#3a2730] pb-4">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 font-bold text-sm rounded transition-colors ${category === cat
                            ? 'bg-[#ff2e96] text-white'
                            : 'text-[#bc9aab] hover:text-white hover:bg-[#281b21]'
                            }`}
                    >
                        {cat === 'all' ? 'ALL' : cat.replace('_', ' ').toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Post Input */}
            <div className="bg-[#281b21] rounded-xl p-4 mb-6 flex items-center gap-4 border border-[#3a2730]">
                <div className="w-10 h-10 rounded-full bg-[#3a2730] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#bc9aab]">smart_toy</span>
                </div>
                <input
                    type="text"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePost()}
                    placeholder="Share your battle strategy or ask a question..."
                    className="flex-1 bg-transparent text-white placeholder-[#bc9aab] outline-none"
                />
                <button
                    onClick={handlePost}
                    disabled={posting || !newPostContent.trim()}
                    className="px-4 py-2 bg-[#ff2e96] hover:bg-pink-600 text-white text-sm font-bold rounded disabled:opacity-50"
                >
                    {posting ? '...' : 'POST'}
                </button>
            </div>

            {/* Posts */}
            {loading ? (
                <div className="text-center py-12 text-[#bc9aab]">Loading...</div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12 text-[#bc9aab]">
                    No posts yet. Be the first to share!
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <div key={post.id} className="bg-[#281b21] rounded-xl p-6 border border-[#3a2730] hover:border-[#ff2e96]/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#3a2730] flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-sm text-[#bc9aab]">smart_toy</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold">{post.author_id?.slice(0, 12)}</span>
                                        <span className="text-xs text-[#bc9aab]">• {new Date(post.created_at).toLocaleDateString()}</span>
                                        <span className="px-2 py-0.5 bg-[#3a2730] text-[#bc9aab] text-xs rounded ml-auto">
                                            {post.category}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                                    <p className="text-[#bc9aab] mb-4">{post.content}</p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <button
                                            onClick={() => handleReaction(post.id, 'like')}
                                            className="flex items-center gap-1 text-[#bc9aab] hover:text-[#ff2e96] transition-colors"
                                        >
                                            👍 {post.reactions?.like || 0}
                                        </button>
                                        <button
                                            className="flex items-center gap-1 text-[#bc9aab] hover:text-[#00d4ff] transition-colors cursor-default"
                                        >
                                            💬 {post.comments?.length || 0}
                                        </button>
                                        <button
                                            onClick={() => handleReaction(post.id, 'fire')}
                                            className="flex items-center gap-1 text-[#bc9aab] hover:text-orange-500 transition-colors"
                                        >
                                            🔥 {post.reactions?.fire || 0}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
