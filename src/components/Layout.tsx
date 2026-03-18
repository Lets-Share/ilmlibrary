import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { BookOpen, Search, LogOut, User, Settings as SettingsIcon, Upload, Shield, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import logo from '../logo.png';

export function Layout() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600 dark:text-indigo-400">
            <img 
              src={logo} 
              alt="IlmLibrary" 
              className="h-45 w-auto" 
            />
          </Link>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search books, authors, categories..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 border-transparent focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all"
              />
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link to="/library" className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400">Library</Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/upload" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800" title="Upload Book">
                  <Upload className="w-5 h-5" />
                </Link>
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-amber-600" title="Admin Dashboard">
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
                <Link to="/settings" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800" title="Settings">
                  <SettingsIcon className="w-5 h-5" />
                </Link>
                <button onClick={handleLogout} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-red-600" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-9 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-zinc-900 dark:text-white mb-4">
                <img 
                  src={logo} 
                  alt="IlmLibrary" 
                  className="h-60 w-auto" 
                />
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs mt-4">
                Empowering students in Pakistan with free access to educational resources and books.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Quick Links</h3>
              <div className="flex flex-col gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 w-fit">Home</Link>
                <Link to="/library" className="hover:text-indigo-600 dark:hover:text-indigo-400 w-fit">Library</Link>
                <Link to="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 w-fit">Contact Us</Link>
                <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 w-fit">Privacy Policy</Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Connect With Us</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              &copy; {new Date().getFullYear()} IlmLibrary. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
