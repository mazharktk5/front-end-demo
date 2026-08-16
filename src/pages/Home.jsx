import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

function StatCard({ label, value }) {
    return (
        <div className="bg-white border border-slate-200 rounded-lg p-5">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">{label}</p>
        </div>
    );
}

export default function Home() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ title: '', description: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [editImageFile, setEditImageFile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [adding, setAdding] = useState(false);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // ── READ ─────────────────────────────────────────────────────────────────────
    const fetchItems = async () => {
        try {
            const { data } = await api.get('/items');
            setItems(data);
        } catch {
            toast.error('Failed to load items');
        }
    };

    useEffect(() => { fetchItems(); }, []);

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setEditImageFile(file);
        setEditItem((prev) => ({ ...prev, _previewUrl: URL.createObjectURL(file) }));
    };

    // ── CREATE ───────────────────────────────────────────────────────────────────
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            toast.warning('Title is required');
            return;
        }
        if (form.title.trim().length < 2) {
            toast.warning('Title must be at least 2 characters');
            return;
        }
        if (!form.description.trim()) {
            toast.warning('Description is required');
            return;
        }
        setAdding(true);
        try {
            const payload = new FormData();
            payload.append('title', form.title);
            payload.append('description', form.description);
            if (imageFile) payload.append('image', imageFile);

            await api.post('/items', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setForm({ title: '', description: '' });
            setImageFile(null);
            setImagePreview(null);
            toast.success('Item added successfully');
            fetchItems();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add item');
        } finally {
            setAdding(false);
        }
    };

    // ── UPDATE ───────────────────────────────────────────────────────────────────
    const openEdit = (item) => {
        setEditItem({ ...item });
        setEditImageFile(null);
        setShowModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editItem.title.trim()) {
            toast.warning('Title cannot be empty');
            return;
        }
        if (!editItem.description.trim()) {
            toast.warning('Description cannot be empty');
            return;
        }
        try {
            const payload = new FormData();
            payload.append('title', editItem.title);
            payload.append('description', editItem.description);
            if (editImageFile) payload.append('image', editImageFile);

            await api.put(`/items/${editItem._id}`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Item updated successfully');
            setShowModal(false);
            setEditImageFile(null);
            fetchItems();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update item');
        }
    };

    // ── DELETE ───────────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`/items/${id}`);
            toast.success('Item deleted');
            fetchItems();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete item');
        }
    };

    const todayCount = items.filter(
        (i) => new Date(i.createdAt).toDateString() === new Date().toDateString()
    ).length;

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <span className="text-slate-900 text-base font-bold tracking-tight">DevManager</span>
                <div className="flex items-center gap-5">
                    <span className="text-sm text-slate-500 hidden sm:block">{user.email}</span>
                    <span className="text-sm font-medium text-slate-700">{user.name}</span>
                    <button
                        onClick={() => navigate('/blog')}
                        className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition"
                    >
                        AI Blog
                    </button>
                    <button
                        onClick={logout}
                        className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                    >
                        Sign Out
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard label="Total Items" value={items.length} />
                    <StatCard label="Added Today" value={todayCount} />
                    <StatCard label="Account" value={user.name} />
                </div>

                {/* Add Item */}
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">New Item</h2>
                    <form onSubmit={handleCreate} className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="Title"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                            <button
                                type="submit"
                                disabled={adding}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 whitespace-nowrap"
                            >
                                {adding ? 'Adding...' : 'Add Item'}
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-500 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {imageFile ? imageFile.name : 'Attach image (optional)'}
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                            {imagePreview && (
                                <div className="flex items-center gap-2">
                                    <img src={imagePreview} alt="preview" className="h-10 w-10 object-cover rounded-md border border-slate-200" />
                                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-xs text-red-500 hover:underline">Remove</button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Items Table */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Items</h2>
                        <span className="text-xs text-slate-400">{items.length} record{items.length !== 1 ? 's' : ''}</span>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-sm font-medium text-slate-400">No items found</p>
                            <p className="text-xs text-slate-300 mt-1">Add your first item using the form above</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Image</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            {item.imageUrl
                                                ? <img src={item.imageUrl} alt={item.title} className="h-10 w-10 object-cover rounded-md border border-slate-200" />
                                                : <div className="h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-300 text-xs">N/A</div>
                                            }
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">{item.title}</td>
                                        <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{item.description}</td>
                                        <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                                            {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 justify-end">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-100 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                    onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                >
                    <div className="bg-white rounded-xl shadow-xl p-7 w-full max-w-md border border-slate-200">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-base font-bold text-slate-800">Edit Item</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-700 transition text-lg leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                                <input
                                    type="text"
                                    value={editItem.title}
                                    onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                                    required
                                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                <input
                                    type="text"
                                    value={editItem.description}
                                    onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                                    required
                                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Image</label>
                                <div className="flex items-center gap-3">
                                    {(editItem._previewUrl || editItem.imageUrl) && (
                                        <img
                                            src={editItem._previewUrl || editItem.imageUrl}
                                            alt="current"
                                            className="h-12 w-12 object-cover rounded-md border border-slate-200"
                                        />
                                    )}
                                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-500 transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {editImageFile ? editImageFile.name : 'Replace image'}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleEditImageChange} />
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                                >
                                    Update Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

