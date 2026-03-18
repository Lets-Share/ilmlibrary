import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../store/authStore';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Bookmark, BookmarkCheck, List } from 'lucide-react';
import { toast } from 'sonner';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function Reader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [book, setBook] = useState<any>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'books', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBook({ id: docSnap.id, ...docSnap.data() });
          
          // Load saved progress
          if (profile?.readingProgress?.[id]) {
            setPageNumber(profile.readingProgress[id]);
            setPageInput(profile.readingProgress[id].toString());
          }
          
          // Load bookmarks
          if (profile?.bookmarks?.[id]) {
            setBookmarks(profile.bookmarks[id]);
          }
        } else {
          toast.error('Book not found');
          navigate('/library');
        }
      } catch (error) {
        console.error('Error fetching book:', error);
        toast.error('Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, navigate, profile?.readingProgress, profile?.bookmarks]);

  // Save progress when page changes
  useEffect(() => {
    const saveProgress = async () => {
      if (!user || !id || !numPages) return;
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          [`readingProgress.${id}`]: pageNumber
        });
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    };

    const timer = setTimeout(saveProgress, 2000); // Debounce save
    return () => clearTimeout(timer);
  }, [pageNumber, id, user, numPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'ArrowRight') {
        changePage(1);
      } else if (e.key === 'ArrowLeft') {
        changePage(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages]);

  // Prevent right click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      if (newPage >= 1 && (numPages ? newPage <= numPages : true)) {
        setPageInput(newPage.toString());
        return newPage;
      }
      return prevPageNumber;
    });
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const submitPageInput = () => {
    const newPage = parseInt(pageInput, 10);
    if (!isNaN(newPage) && newPage >= 1 && (numPages ? newPage <= numPages : true)) {
      setPageNumber(newPage);
    } else {
      // Revert to current page if invalid
      setPageInput(pageNumber.toString());
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submitPageInput();
      (e.target as HTMLInputElement).blur();
    }
  };

  const changeScale = (offset: number) => {
    setScale(prevScale => Math.max(0.5, Math.min(prevScale + offset, 3.0)));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const toggleBookmark = async () => {
    if (!user || !id) {
      toast.error('You must be logged in to bookmark pages');
      return;
    }

    const isBookmarked = bookmarks.includes(pageNumber);
    let newBookmarks;
    
    if (isBookmarked) {
      newBookmarks = bookmarks.filter(b => b !== pageNumber);
      toast.success(`Removed bookmark for page ${pageNumber}`);
    } else {
      newBookmarks = [...bookmarks, pageNumber].sort((a, b) => a - b);
      toast.success(`Bookmarked page ${pageNumber}`);
    }

    setBookmarks(newBookmarks);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`bookmarks.${id}`]: newBookmarks
      });
    } catch (error) {
      console.error('Error saving bookmark:', error);
      toast.error('Failed to save bookmark');
      // Revert on error
      setBookmarks(bookmarks);
    }
  };

  const jumpToBookmark = (page: number) => {
    setPageNumber(page);
    setPageInput(page.toString());
    setShowBookmarks(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-400">Loading reader...</p>
        </div>
      </div>
    );
  }

  if (!book) return null;

  const isCurrentPageBookmarked = bookmarks.includes(pageNumber);

  return (
    <div ref={containerRef} className="min-h-screen bg-zinc-950 flex flex-col select-none">
      {/* Reader Toolbar */}
      <div className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/book/${id}`)}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Back to details"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-medium truncate max-w-[200px] md:max-w-md">{book.title}</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="relative">
            <button 
              onClick={() => setShowBookmarks(!showBookmarks)}
              className={`p-2 rounded-full hover:bg-zinc-800 transition-colors ${showBookmarks ? 'text-indigo-400 bg-zinc-800' : 'text-zinc-400 hover:text-white'}`}
              title="View Bookmarks"
            >
              <List className="w-5 h-5" />
            </button>
            
            {showBookmarks && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-3 border-b border-zinc-700 font-medium text-white">Bookmarks</div>
                <div className="max-h-64 overflow-y-auto">
                  {bookmarks.length === 0 ? (
                    <div className="p-4 text-sm text-zinc-400 text-center">No bookmarks yet</div>
                  ) : (
                    bookmarks.map(page => (
                      <button
                        key={page}
                        onClick={() => jumpToBookmark(page)}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors flex items-center justify-between"
                      >
                        <span>Page {page}</span>
                        {page === pageNumber && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={toggleBookmark}
            className={`p-2 rounded-full hover:bg-zinc-800 transition-colors ${isCurrentPageBookmarked ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'}`}
            title={isCurrentPageBookmarked ? "Remove Bookmark" : "Add Bookmark"}
          >
            {isCurrentPageBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 bg-zinc-800 rounded-xl p-1">
            <button 
              onClick={() => changeScale(-0.1)}
              className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-zinc-300 text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
            <button 
              onClick={() => changeScale(0.1)}
              className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={toggleFullscreen}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors hidden sm:block"
            title="Fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-zinc-950 flex justify-center p-4 md:p-8 relative" onClick={() => setShowBookmarks(false)}>
        <div className="relative shadow-2xl">
          <Document
            file={book.fileURL}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-[600px] w-[400px] bg-zinc-900 rounded-lg animate-pulse">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            }
            error={
              <div className="flex items-center justify-center h-[600px] w-[400px] bg-zinc-900 rounded-lg text-red-400 p-8 text-center">
                Failed to load PDF. Please check your connection or try again later.
              </div>
            }
            className="pdf-document"
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="pdf-page bg-white"
            />
          </Document>
          
          {/* Invisible overlay to prevent interaction with the canvas directly if needed */}
          <div className="absolute inset-0 z-10 pointer-events-none" />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="h-16 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
        <div className="flex items-center gap-4 w-1/3">
          <span className="text-zinc-400 text-sm hidden sm:block">
            {numPages ? `${Math.round((pageNumber / numPages) * 100)}% read` : 'Loading...'}
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 w-1/3">
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => changePage(-1)}
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={numPages || 1}
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputKeyDown}
              onBlur={submitPageInput}
              className="w-16 bg-zinc-800 text-white text-center rounded-lg py-1 px-2 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <span className="text-zinc-400 font-mono">/ {numPages || '--'}</span>
          </div>
          
          <button
            type="button"
            disabled={pageNumber >= (numPages || 1)}
            onClick={() => changePage(1)}
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="w-1/3 flex justify-end">
          {/* Progress bar */}
          <div className="w-full max-w-[200px] h-1.5 bg-zinc-800 rounded-full overflow-hidden hidden md:block">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${numPages ? (pageNumber / numPages) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
