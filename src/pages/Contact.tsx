import { Mail, Phone, MapPin, Send } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

export function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending
    setTimeout(() => {
      toast.success('Message sent successfully! We will get back to you soon.');
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4">Get in Touch</h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Have questions about IlmLibrary? We're here to help. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Email Us</p>
                    <a href="mailto:support@ilmlibrary.com" className="text-lg font-semibold text-zinc-900 dark:text-white hover:text-indigo-600 transition-colors">support@ilmlibrary.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Call Us</p>
                    <a href="tel:+923001234567" className="text-lg font-semibold text-zinc-900 dark:text-white hover:text-indigo-600 transition-colors">+92 300 1234567</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Location</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-white">Lahore, Pakistan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-8">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Your Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Message</label>
                  <textarea
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-900 dark:text-white resize-none"
                    placeholder="Write your message here..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70"
                >
                  {loading ? 'Sending...' : <><Send className="w-5 h-5" /> Send Message</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
