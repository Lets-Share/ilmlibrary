import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen } from 'lucide-react';

export function Library() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterType, setFilterType] = useState<'all' | 'free' | 'premium'>('all');

  const categories = ['All', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Literature'];

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'books'), where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    const matchesType = filterType === 'all' ? true : filterType === 'free' ? !book.isPremium : book.isPremium;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">Library</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Explore our vast collection of books.</p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-1">
              <button 
                onClick={() => setFilterType('all')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'all' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterType('free')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === 'free' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
              >
                Free
              </button>
              <button 
                onClick={() => setFilterType('premium')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === 'premium' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
              >
                Premium
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-6 mb-8 hide-scrollbar">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full border whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredBooks.map((book) => (
              <Link key={book.id} to={`/book/${book.id}`} className="group flex flex-col gap-3">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800 group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 bg-white dark:bg-zinc-900">
                  <img src={book.coverURL || `https://picsum.photos/seed/${book.id}/400/600`} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {book.isPremium && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded shadow-sm uppercase tracking-wider">
                      Premium
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{book.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">{book.author}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <BookOpen className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-zinc-900 dark:text-white mb-2">No books found</h3>
            <p className="text-zinc-500 dark:text-zinc-400">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
