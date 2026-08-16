import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Blog() {
    const [topic, setTopic] = useState('');
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(null);
    const navigate = useNavigate();

    const handleGenerate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/blog/generate', { topic });
            setBlogs((prev) => [{ id: Date.now(), topic, content: data.blog }, ...prev]);
            setTopic('');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (id, text) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleDelete = (id) => {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/home')}
                        className="text-slate-400 hover:text-slate-700 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="text-slate-900 text-base font-bold tracking-tight">AI Blog Generator</span>
                </div>
                {blogs.length > 0 && (
                    <span className="text-xs text-slate-400 font-medium">{blogs.length} blog{blogs.length !== 1 ? 's' : ''} generated</span>
                )}
            </nav>

            <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

                {/* Hero */}
                <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
                    <h1 className="text-2xl font-bold mb-1">Generate a Blog Post</h1>
                    <p className="text-violet-200 text-sm mb-6">Enter any topic and let AI write a full blog post for you.</p>
                    <form onSubmit={handleGenerate} className="flex gap-3">
                        <input
                            type="text"
                            placeholder="e.g. The future of solar energy"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                            className="flex-1 bg-white/20 backdrop-blur border border-white/30 text-white placeholder-violet-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-white text-violet-700 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-violet-50 transition disabled:opacity-60 whitespace-nowrap flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Generating…
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Generate
                                </>
                            )}
                        </button>
                    </form>
                    {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-1/3" />
                        <div className="h-3 bg-slate-100 rounded w-full" />
                        <div className="h-3 bg-slate-100 rounded w-5/6" />
                        <div className="h-3 bg-slate-100 rounded w-4/6" />
                    </div>
                )}

                {/* Blog history */}
                {blogs.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-400">No blogs yet</p>
                        <p className="text-xs text-slate-300 mt-1">Enter a topic above and hit Generate</p>
                    </div>
                )}

                <div className="space-y-6">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            {/* Card header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                                    <span className="text-sm font-semibold text-slate-700">{blog.topic}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleCopy(blog.id, blog.content)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition"
                                    >
                                        {copied === blog.id ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Copy
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(blog.id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                            {/* Blog content */}
                            <div className="px-6 py-5 text-slate-700 text-sm leading-7 whitespace-pre-wrap">
                                {blog.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

