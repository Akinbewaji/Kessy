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
      role: 'user', // Default role
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
        const ownerEmails = ['digitalkessy350@gmail.com', 'akintomiwabewaji@gmail.com'];
        unsubDoc = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
          let data = null;
          if (docSnap.exists()) {
            data = docSnap.data();
          } else {
            // Handle users who logged in via Google or missing doc
            data = { email: user.email, credits: 0 };
          }
          
          // Hardcode owner emails to always be admin
          if (user.email && ownerEmails.includes(user.email.toLowerCase())) {
            data.role = 'admin';
          }
            
            // Attach permissions
            data.permissions = { canBypassCredits: false, canManageUsers: false, canManageRoles: false };
            if (data.role === 'admin') {
              data.permissions = { canBypassCredits: true, canManageUsers: true, canManageRoles: true };
            } else if (data.role && data.role !== 'user') {
              import('firebase/firestore').then(async ({ getDoc, doc: fdoc }) => {
                const roleDoc = await getDoc(fdoc(db, 'roles', data.role));
                if (roleDoc.exists()) {
                  data.permissions = roleDoc.data();
                }
                setUserData({ ...data }); // Trigger update with permissions
              });
            }
            
            setUserData(data);
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
