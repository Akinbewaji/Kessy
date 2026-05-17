import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(undefined);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Create user document in Firestore
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      credits: 2, // Give 2 free credits on signup!
      createdAt: Date.now()
    });
    return cred;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    let unsubDoc;
    
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      
      if (user) {
        unsubDoc = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore onSnapshot error:", error);
          setUserData(null);
          setLoading(false);
        });
      } else {
        setUserData(undefined);
        setLoading(false);
        if (unsubDoc) unsubDoc();
      }
    });

    return () => {
      unsubscribe();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  const value = {
    currentUser,
    userData,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050005' }}>
          <div className="dots">
            <div className="dot" style={{ background: 'var(--accent, #8B5CF6)' }}></div>
            <div className="dot" style={{ background: 'var(--accent, #8B5CF6)' }}></div>
            <div className="dot" style={{ background: 'var(--accent, #8B5CF6)' }}></div>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}
