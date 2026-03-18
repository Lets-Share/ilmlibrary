import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Star, ChevronRight } from 'lucide-react';

export function Home() {
  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const q = query(collection(db, 'books'), where('status', '==', 'approved'), orderBy('createdAt', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNewArrivals(books);
        setFeaturedBooks(books.slice(0, 5));
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=3506&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-80 dark:opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg mb-6"
          >
            Discover Your Next Great Read
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-100 drop-shadow-md mb-8"
          >
            Explore thousands of books, from academic texts to thrilling novels.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/library" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
              Browse Library <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Books Horizontal Scroll */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-24 relative z-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Featured Books</h2>
          <Link to="/library" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View All</Link>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[220px] h-[320px] bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse shrink-0 snap-start" />
            ))
          ) : (
            featuredBooks.map((book) => (
              <Link key={book.id} to={`/book/${book.id}`} className="min-w-[220px] group shrink-0 snap-start">
                <div className="relative h-[320px] rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  <img src={book.coverURL || `https://picsum.photos/seed/${book.id}/400/600`} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    {book.isPremium && (
                      <span className="inline-block px-2 py-1 bg-amber-500 text-[10px] font-bold rounded mb-2 uppercase tracking-wider">Premium</span>
                    )}
                    <h3 className="text-lg font-bold line-clamp-2 mb-1">{book.title}</h3>
                    <p className="text-zinc-300 text-xs">{book.author}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
          {['All', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Literature'].map((cat) => (
            <button key={cat} className="px-6 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 hover:border-indigo-600 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium whitespace-nowrap transition-colors">
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> New Arrivals
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
            ))
          ) : (
            newArrivals.map((book) => (
              <Link key={book.id} to={`/book/${book.id}`} className="group flex flex-col gap-3">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  <img src={book.coverURL || `https://picsum.photos/seed/${book.id}/400/600`} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {book.isPremium && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded shadow-sm uppercase tracking-wider">
                      Premium
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{book.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">{book.author}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
