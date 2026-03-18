import { Link } from 'react-router-dom';
import { BookOpen, Home } from 'lucide-react';
import logo from '../logo.png';

export function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-8 rotate-12 shadow-xl overflow-hidden relative">
        <img 
          src={logo} 
          alt="IlmLibrary" 
          className="w-full h-full object-contain -rotate-12 absolute inset-0 m-auto" 
        />
      </div>
      <h1 className="text-6xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">404</h1>
      <h2 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300 mb-6">Page Not Found</h2>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-10 text-lg">
        The page you are looking for doesn't exist or has been moved. Let's get you back to the library.
      </p>
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1"
      >
        <Home className="w-5 h-5" /> Back to Home
      </Link>
    </div>
  );
}
