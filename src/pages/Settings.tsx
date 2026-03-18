import React, { useState, useEffect } from 'react';
import { updateProfile, updatePassword, deleteUser } from 'firebase/auth';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuthStore } from '../store/authStore';
import { User, Lock, Moon, Sun, Trash2, Save, BookOpen, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export function Settings() {
  const { user, profile, setProfile } = useAuthStore();
  const [name, setName] = useState(profile?.name || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedBooks, setSavedBooks] = useState<any[]>([]);
  const [uploadedBooks, setUploadedBooks] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserBooks = async () => {
      if (!user) return;
      try {
        // Fetch uploaded books
        const uploadedQuery = query(collection(db, 'books'), where('uploadedBy', '==', user.uid));
        const uploadedSnap = await getDocs(uploadedQuery);
        const uploadedData = uploadedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUploadedBooks(uploadedData);

        // Fetch saved books
        if (profile?.savedBooks && profile.savedBooks.length > 0) {
          // Firestore 'in' query supports up to 10 items. For simplicity, we'll fetch all and filter client-side if > 10,
          // or just use multiple queries. Here we'll chunk it or just fetch all books and filter.
          // Better approach for this demo: fetch books by ID in chunks of 10.
          const chunks = [];
          for (let i = 0; i < profile.savedBooks.length; i += 10) {
            chunks.push(profile.savedBooks.slice(i, i + 10));
          }
          
          let savedData: any[] = [];
          for (const chunk of chunks) {
            const savedQuery = query(collection(db, 'books'), where(documentId(), 'in', chunk));
            const savedSnap = await getDocs(savedQuery);
            savedData = [...savedData, ...savedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))];
          }
          setSavedBooks(savedData);
        } else {
          setSavedBooks([]);
        }
      } catch (error) {
        console.error("Error fetching user books:", error);
      }
    };

    fetchUserBooks();
  }, [user, profile?.savedBooks]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName: name });
      await updateDoc(doc(db, 'users', user.uid), { name });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !password) return;
    setLoading(true);
    try {
      await updatePassword(user, password);
      setPassword('');
      toast.success('Password updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password. You may need to re-authenticate.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    if (!user || !profile) return;
    const newTheme = profile.theme === 'dark' ? 'light' : 'dark';
    try {
      await updateDoc(doc(db, 'users', user.uid), { theme: newTheme });
      setProfile({ ...profile, theme: newTheme });
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      toast.success(`Theme changed to ${newTheme}`);
    } catch (error) {
      toast.error('Failed to update theme');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
      toast.success('Account deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account. You may need to re-authenticate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">Profile Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Settings */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Profile Information</h2>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-zinc-500 cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </form>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Security</h2>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !password}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70"
              >
                <Lock className="w-4 h-4" /> Update Password
              </button>
            </form>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
            <div className="flex items-center gap-3 mb-6">
              {profile?.theme === 'dark' ? <Moon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> : <Sun className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Preferences</h2>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-white">Theme</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Toggle between light and dark mode</p>
              </div>
              <button
                onClick={toggleTheme}
                className="p-3 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {profile?.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl shadow-sm border border-red-200 dark:border-red-900/30 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-500" />
                <h2 className="text-xl font-semibold text-red-900 dark:text-red-400">Danger Zone</h2>
              </div>
              <p className="text-sm text-red-700 dark:text-red-400/80 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70"
              >
                Delete Account
              </button>
            </div>
          </div>

          {/* Sidebar: User Books */}
          <div className="space-y-8">
            {/* Saved Books */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Saved Books</h2>
              </div>
              {savedBooks.length > 0 ? (
                <div className="space-y-4">
                  {savedBooks.map(book => (
                    <Link key={book.id} to={`/book/${book.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <img src={book.coverURL || `https://picsum.photos/seed/${book.id}/100/150`} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm" referrerPolicy="no-referrer" />
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-white line-clamp-1 text-sm">{book.title}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{book.author}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No saved books yet.</p>
              )}
            </div>

            {/* Uploaded Books */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <UploadCloud className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">My Uploads</h2>
              </div>
              {uploadedBooks.length > 0 ? (
                <div className="space-y-4">
                  {uploadedBooks.map(book => (
                    <Link key={book.id} to={`/book/${book.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <img src={book.coverURL || `https://picsum.photos/seed/${book.id}/100/150`} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-zinc-900 dark:text-white line-clamp-1 text-sm">{book.title}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{book.author}</p>
                      </div>
                      <div className="shrink-0">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                          book.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          book.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {book.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">You haven't uploaded any books yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
