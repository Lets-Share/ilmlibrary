import { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle, XCircle, Trash2, Shield, Star, BookOpen, Users } from 'lucide-react';
import { toast } from 'sonner';

export function Admin() {
  const [books, setBooks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'users'>('pending');

  const fetchData = async () => {
    setLoading(true);
    try {
      const booksQuery = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
      const booksSnap = await getDocs(booksQuery);
      setBooks(booksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const usersSnap = await getDocs(usersQuery);
      setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'books', id), { status });
      setBooks(books.map(b => b.id === id ? { ...b, status } : b));
      toast.success(`Book ${status} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleTogglePremium = async (id: string, currentPremium: boolean) => {
    try {
      await updateDoc(doc(db, 'books', id), { isPremium: !currentPremium });
      setBooks(books.map(b => b.id === id ? { ...b, isPremium: !currentPremium } : b));
      toast.success(`Premium status updated`);
    } catch (error) {
      console.error('Error toggling premium:', error);
      toast.error('Failed to update premium status');
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await deleteDoc(doc(db, 'books', id));
      setBooks(books.filter(b => b.id !== id));
      toast.success('Book deleted successfully');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

  const handleToggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      await updateDoc(doc(db, 'users', id), { role: newRole });
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const pendingBooks = books.filter(b => b.status === 'pending');
  const approvedBooks = books.filter(b => b.status === 'approved');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Manage books, users, and platform settings.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800 mb-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'pending' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
          >
            Pending Approvals ({pendingBooks.length})
            {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'approved' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
          >
            Approved Books ({approvedBooks.length})
            {activeTab === 'approved' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'users' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
          >
            Users ({users.length})
            {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />)}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {activeTab === 'pending' && (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {pendingBooks.length === 0 ? (
                  <div className="p-12 text-center text-zinc-500">No pending books to review.</div>
                ) : (
                  pendingBooks.map(book => (
                    <div key={book.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden shrink-0">
                          <img src={book.coverURL || `https://picsum.photos/seed/${book.id}/100/150`} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-zinc-900 dark:text-white text-lg">{book.title}</h3>
                          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-2">by {book.author} • {book.category}</p>
                          <p className="text-zinc-600 dark:text-zinc-300 text-sm line-clamp-2 max-w-2xl">{book.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <a href={book.fileURL} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Review PDF">
                          <BookOpen className="w-5 h-5" />
                        </a>
                        <button onClick={() => handleUpdateStatus(book.id, 'approved')} className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors" title="Approve">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleUpdateStatus(book.id, 'rejected')} className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors" title="Reject">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'approved' && (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {approvedBooks.length === 0 ? (
                  <div className="p-12 text-center text-zinc-500">No approved books yet.</div>
                ) : (
                  approvedBooks.map(book => (
                    <div key={book.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                          <img src={book.coverURL || `https://picsum.photos/seed/${book.id}/100/150`} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-zinc-900 dark:text-white">{book.title}</h3>
                            {book.isPremium && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded uppercase tracking-wider">Premium</span>}
                          </div>
                          <p className="text-zinc-500 dark:text-zinc-400 text-sm">by {book.author}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button onClick={() => handleTogglePremium(book.id, book.isPremium)} className={`p-2 rounded-full transition-colors ${book.isPremium ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-amber-500'}`} title={book.isPremium ? "Remove Premium" : "Make Premium"}>
                          <Star className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteBook(book.id)} className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors" title="Delete Book">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {users.length === 0 ? (
                  <div className="p-12 text-center text-zinc-500">No users found.</div>
                ) : (
                  users.map(u => (
                    <div key={u.id} className="p-6 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold">
                          {u.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-zinc-900 dark:text-white">{u.name}</h3>
                            {u.role === 'admin' && <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded uppercase tracking-wider">Admin</span>}
                          </div>
                          <p className="text-zinc-500 dark:text-zinc-400 text-sm">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:block">
                          Joined {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                        <button 
                          onClick={() => handleToggleRole(u.id, u.role)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            u.role === 'admin' 
                              ? 'bg-zinc-100 text-zinc-600 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-red-900/20 dark:hover:text-red-400' 
                              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40'
                          }`}
                        >
                          {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
