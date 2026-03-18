import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, User, BookOpen, Check } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../logo.png';
import { motion, AnimatePresence } from 'framer-motion';

export function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!isLogin && password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (!isLogin && password.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }
    if (!isLogin && !acceptTerms) {
      toast.error('Please accept the terms and conditions!');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Successfully logged in!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile with name
        if (name) {
          await updateProfile(userCredential.user, {
            displayName: name
          });
        }
        toast.success('Account created successfully! Welcome to IlmLibrary!');
      }
      navigate('/');
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Email/Password Sign-In is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.');
        return;
      }
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered! Please sign in.');
        return;
      }
      if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters.');
        return;
      }
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Successfully logged in with Google!');
      navigate('/');
    } catch (error: any) {
      console.error('Google auth error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Google Sign-In is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.');
        return;
      }
      toast.error(error.message || 'Google authentication failed');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, 100, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            y: [0, -30, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl"
        />
      </div>

      {/* Floating shapes */}
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-4 h-4 bg-white/30 rounded-full"
      />
      <motion.div 
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-32 left-32 w-6 h-6 bg-white/20 rounded-full"
      />
      <motion.div 
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/2 right-1/3 w-3 h-3 bg-purple-200/40 rounded-full"
      />

      <div className="relative min-h-screen flex flex-col justify-center py-8 sm:py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="flex justify-center">
            <motion.div
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-2xl" />
              <motion.img 
                src={logo} 
                alt="IlmLibrary" 
                className="relative h-20 w-auto object-contain rounded-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              />
            </motion.div>
          </div>
          
          <motion.div 
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="mt-6 text-center text-4xl font-extrabold text-white drop-shadow-lg">
              {isLogin ? 'Welcome Back!' : 'Join IlmLibrary'}
            </h2>
          </motion.div>
          <p className="mt-3 text-center text-lg text-white/80">
            {isLogin ? 'Sign in to continue your learning journey' : 'Start your free learning journey today'}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="bg-white/10 dark:bg-zinc-900/30 backdrop-blur-lg py-8 px-6 sm:px-10 shadow-2xl sm:rounded-2xl border border-white/20 dark:border-white/10">
            <form className="space-y-4" onSubmit={handleAuth}>
              {/* Name field - Only for signup */}
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-white/90">Full Name</label>
                    <div className="mt-1 relative rounded-xl shadow-lg">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-white/60" />
                      </div>
                      <motion.input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        whileFocus={{ scale: 1.02 }}
                        className="block w-full pl-10 pr-4 py-3 bg-white/20 dark:bg-black/20 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm transition-all"
                        placeholder="Your full name"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-white/90">Email address</label>
                <div className="mt-1 relative rounded-xl shadow-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/60" />
                  </div>
                  <motion.input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    whileFocus={{ scale: 1.02 }}
                    className="block w-full pl-10 pr-4 py-3 bg-white/20 dark:bg-black/20 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <label className="block text-sm font-medium text-white/90">Password</label>
                <div className="mt-1 relative rounded-xl shadow-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/60" />
                  </div>
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    whileFocus={{ scale: 1.02 }}
                    className="block w-full pl-10 pr-12 py-3 bg-white/20 dark:bg-black/20 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-white/60 hover:text-white" />
                    ) : (
                      <Eye className="h-5 w-5 text-white/60 hover:text-white" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password - Only for signup */}
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-white/90">Confirm Password</label>
                    <div className="mt-1 relative rounded-xl shadow-lg">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-white/60" />
                      </div>
                      <motion.input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        whileFocus={{ scale: 1.02 }}
                        className="block w-full pl-10 pr-12 py-3 bg-white/20 dark:bg-black/20 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm transition-all"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Terms checkbox - Only for signup */}
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="sr-only"
                        />
                        <div 
                          onClick={() => setAcceptTerms(!acceptTerms)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            acceptTerms 
                              ? 'bg-indigo-500 border-indigo-500' 
                              : 'border-white/40 group-hover:border-white/60'
                          }`}
                        >
                          {acceptTerms && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <span className="text-sm text-white/70">
                        I agree to the{' '}
                        <Link to="/privacy" className="text-white underline hover:text-indigo-300">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-white underline hover:text-indigo-300">Privacy Policy</Link>
                      </span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forgot password - Only for login */}
              {isLogin && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-end"
                >
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-white/70 hover:text-white underline underline-offset-2"
                  >
                    Forgot password?
                  </Link>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                >
                  {loading ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"
                    />
                  ) : isLogin ? (
                    <>
                      <LogIn className="w-5 h-5" /> Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" /> Create Account
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-5"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-transparent text-white/60">Or continue with</span>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="mt-4"
              >
                <motion.button
                  onClick={handleGoogleLogin}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full inline-flex justify-center py-3 px-4 border border-white/20 rounded-xl shadow-md bg-white/10 text-white font-medium hover:bg-white/20 transition-all backdrop-blur-sm"
                >
                  <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-5 text-center"
            >
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  // Reset form when switching
                  setName('');
                  setConfirmPassword('');
                  setAcceptTerms(false);
                }}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                <span className="underline decoration-white/30 underline-offset-4">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <span className="font-bold text-white">
                  {isLogin ? 'Sign up' : 'Sign in'}
                </span>
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
