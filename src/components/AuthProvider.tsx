import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuthStore } from '../store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setAuthReady } = useAuthStore();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        try {
          // Ensure user document exists
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const newUser = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'New User',
              email: firebaseUser.email || '',
              role: firebaseUser.email === 'grabdullah40@gmail.com' ? 'admin' : 'user',
              savedBooks: [],
              readingProgress: {},
              theme: 'light',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userRef, newUser);
          }
        } catch (error) {
          console.error('Error ensuring user document exists:', error);
          // We still want to try to listen to the profile even if creation/fetching failed
        }

        const unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as any;
            setProfile(data);
            if (data.theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
          setAuthReady(true);
        }, (error) => {
          console.error('Error fetching user profile:', error);
          setAuthReady(true);
        });

        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setAuthReady(true);
      }
    });

    return () => unsubscribeAuth();
  }, [setUser, setProfile, setAuthReady]);

  return <>{children}</>;
}
