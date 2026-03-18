import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../store/authStore';
import { UploadCloud, FileText, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function Upload() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Fiction');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const categories = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Literature'];

  const uploadToCloudinary = (file: File, resourceType: 'image' | 'raw', onProgress: (p: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        reject(new Error('Cloudinary configuration is missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.'));
        return;
      }

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const p = Math.round((event.loaded / event.total) * 100);
          onProgress(p);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } catch (error) {
            reject(new Error('Failed to parse Cloudinary response'));
          }
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            reject(new Error(response.error?.message || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred during upload'));
      });

      xhr.open('POST', url, true);
      xhr.send(formData);
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pdfFile || !coverFile) {
      toast.error('Please fill all required fields and upload files.');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Upload Cover Image to Cloudinary
      const coverURL = await uploadToCloudinary(coverFile, 'image', () => {
        // We can track cover progress here if needed, but we'll focus on PDF progress
      });
      
      // Upload PDF File to Cloudinary
      const fileURL = await uploadToCloudinary(pdfFile, 'raw', (p) => {
        setProgress(p);
      });

      // Save metadata to Firestore
      const newBookRef = doc(collection(db, 'books'));
      await setDoc(newBookRef, {
        id: newBookRef.id,
        title,
        author,
        category,
        description,
        fileURL,
        coverURL,
        isPremium: false, // Default to false, admin can change
        status: 'pending', // Requires admin approval
        uploadedBy: user.uid,
        createdAt: new Date().toISOString()
      });

      toast.success('Book uploaded successfully! Waiting for admin approval.');
      navigate('/library');
    } catch (error: any) {
      console.error('Error uploading book:', error);
      toast.error(error.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 md:p-12 border border-zinc-200 dark:border-zinc-800">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Upload a Book</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Share knowledge with the community. All uploads are reviewed by admins before publishing.</p>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Book Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white"
                  placeholder="e.g. The Great Gatsby"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Author *</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white"
                  placeholder="e.g. F. Scott Fitzgerald"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Description *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white resize-none"
                placeholder="Brief synopsis of the book..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Cover Upload */}
              <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group">
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  {coverFile ? (
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                  )}
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {coverFile ? coverFile.name : 'Upload Cover Image'}
                  </p>
                  <p className="text-xs text-zinc-500">JPEG, PNG up to 2MB</p>
                </div>
              </div>

              {/* PDF Upload */}
              <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group">
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  {pdfFile ? (
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  ) : (
                    <FileText className="w-10 h-10 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                  )}
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {pdfFile ? pdfFile.name : 'Upload PDF File'}
                  </p>
                  <p className="text-xs text-zinc-500">PDF up to 50MB</p>
                </div>
              </div>
            </div>

            {uploading && (
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5 mt-4 overflow-hidden">
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed mt-8"
            >
              {uploading ? `Uploading... ${progress}%` : 'Submit for Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
