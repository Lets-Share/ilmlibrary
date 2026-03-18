import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, query, orderBy, getDocs, serverTimestamp, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Bookmark, BookmarkCheck, ArrowLeft, Clock, ShieldAlert, Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

export function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [similarBooks, setSimilarBooks] = useState<any[]>([]);

  useEffect(() => {
    const fetchBookAndReviews = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'books', id);
        const docSnap = await getDoc(docRef);
        let bookData: any = null;
        if (docSnap.exists()) {
          bookData = { id: docSnap.id, ...docSnap.data() };
          setBook(bookData);
        } else {
          toast.error('Book not found');
          navigate('/library');
          return;
        }

        // Fetch reviews
        const reviewsRef = collection(db, 'books', id, 'reviews');
        const q = query(reviewsRef, orderBy('createdAt', 'desc'));
        const reviewsSnap = await getDocs(q);
        setReviews(reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch similar books
        if (bookData.category) {
          const similarQuery = query(
            collection(db, 'books'),
            where('status', '==', 'approved'),
            where('category', '==', bookData.category),
            limit(5)
          );
          const similarSnap = await getDocs(similarQuery);
          const similar = similarSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(b => b.id !== id)
            .slice(0, 4); // Ensure max 4
          setSimilarBooks(similar);
        }

      } catch (error) {
        console.error('Error fetching book:', error);
        toast.error('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookAndReviews();
  }, [id, navigate]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !newReview.trim()) return;
    
    setSubmittingReview(true);
    try {
      const reviewData = {
        userId: user.uid,
        userName: profile?.name || 'Anonymous',
        rating: newRating,
        text: newReview.trim(),
        createdAt: serverTimestamp()
      };
      
      const reviewsRef = collection(db, 'books', id, 'reviews');
      const docRef = await addDoc(reviewsRef, reviewData);
      
      // Update local state
      setReviews([{ id: docRef.id, ...reviewData, createdAt: new Date().toISOString() }, ...reviews]);
      setNewReview('');
      setNewRating(5);
      toast.success('Review submitted successfully');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const isSaved = profile?.savedBooks?.includes(id || '');

  const handleSave = async () => {
    if (!user || !id) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      if (isSaved) {
        await updateDoc(userRef, { savedBooks: arrayRemove(id) });
        toast.success('Removed from saved books');
      } else {
        await updateDoc(userRef, { savedBooks: arrayUnion(id) });
        toast.success('Added to saved books');
      }
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error('Failed to update saved books');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-500">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) return null;

  const siteUrl = 'https://ilmlibrary1.vercel.app';
  const bookUrl = `${siteUrl}/book/${book.id}`;
  const coverUrl = book.coverURL || `https://picsum.photos/seed/${book.id}/400/600`;
  
  const canRead = !book.isPremium || profile?.role === 'admin';
  
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) 
    : 'New';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12">
      <Helmet>
        <title>{book.title} by {book.author} - IlmLibrary</title>
        <meta name="description" content={`${book.title} by ${book.author}. ${book.description?.substring(0, 150)}... Read online for free on IlmLibrary.`} />
        <meta name="keywords" content={`${book.title}, ${book.author}, ${book.category}, free books, online reading, IlmLibrary`} />
        <meta property="og:type" content="book" />
        <meta property="og:title" content={`${book.title} - IlmLibrary`} />
        <meta property="og:description" content={`${book.description?.substring(0, 150)}...`} />
        <meta property="og:image" content={coverUrl} />
        <meta property="og:url" content={bookUrl} />
        <meta property="og:site_name" content="IlmLibrary" />
        <meta property="book:author" content={book.author} />
        <meta property="book:tag" content={book.category} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={`${book.title} - IlmLibrary`} />
        <meta property="twitter:description" content={`${book.description?.substring(0, 150)}...`} />
        <meta property="twitter:image" content={coverUrl} />
        <meta property="twitter:url" content={bookUrl} />
        <link rel="canonical" href={bookUrl} />
      </Helmet>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/library" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </Link>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row">
            {/* Cover Image */}
            <div className="w-full md:w-1/3 bg-zinc-100 dark:bg-zinc-800 p-8 flex items-center justify-center">
              <div className="relative w-full max-w-[280px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                <img src={book.coverURL || `https://picsum.photos/seed/${book.id}/400/600`} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                {book.isPremium && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded shadow-md uppercase tracking-wider">
                    Premium
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-2">{book.title}</h1>
                  <p className="text-xl text-zinc-500 dark:text-zinc-400">by <span className="text-zinc-900 dark:text-zinc-200 font-medium">{book.author}</span></p>
                </div>
                {user && (
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors"
                    title={isSaved ? "Remove from saved" : "Save book"}
                  >
                    {isSaved ? <BookmarkCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> : <Bookmark className="w-6 h-6" />}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <span className="px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  {book.category}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Added {new Date(book.createdAt).toLocaleDateString()}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-current" /> {averageRating} {reviews.length > 0 && `(${reviews.length})`}
                </span>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-10 flex-1">
                <h3 className="text-lg font-semibold mb-3">Synopsis</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {book.description}
                </p>
              </div>

              <div className="mt-auto pt-8 border-t border-zinc-200 dark:border-zinc-800">
                {!user ? (
                  <Link 
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-indigo-500/30"
                  >
                    <BookOpen className="w-5 h-5" /> Sign in to Read
                  </Link>
                ) : canRead ? (
                  <Link 
                    to={`/read/${book.id}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-indigo-500/30"
                  >
                    <BookOpen className="w-5 h-5" /> Read Now
                  </Link>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                    <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-400">Premium Content</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                        This book is available for premium members only. Please contact an administrator to upgrade your account.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Reviews & Ratings</h2>
          </div>

          {user ? (
            <form onSubmit={handleSubmitReview} className="mb-10 bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Write a Review</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star className={`w-6 h-6 ${star <= newRating ? 'text-amber-500 fill-current' : 'text-zinc-300 dark:text-zinc-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Your Review</label>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="What did you think of this book?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview || !newReview.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="mb-10 bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center">
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">Sign in to share your thoughts about this book.</p>
              <Link to="/login" className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
                Sign In
              </Link>
            </div>
          )}

          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-zinc-200 dark:border-zinc-800 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-zinc-900 dark:text-white">{review.userName}</div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {review.createdAt?.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-amber-500 fill-current' : 'text-zinc-300 dark:text-zinc-700'}`} />
                    ))}
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">{review.text}</p>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">No reviews yet. Be the first to review this book!</p>
            )}
          </div>
        </div>

        {/* Similar Books */}
        {similarBooks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Similar Books</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {similarBooks.map((similarBook) => (
                <Link key={similarBook.id} to={`/book/${similarBook.id}`} className="group flex flex-col gap-3">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800 group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 bg-white dark:bg-zinc-900">
                    <img src={similarBook.coverURL || `https://picsum.photos/seed/${similarBook.id}/400/600`} alt={similarBook.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {similarBook.isPremium && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded shadow-sm uppercase tracking-wider">
                        Premium
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{similarBook.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">{similarBook.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
