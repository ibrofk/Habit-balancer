import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile, 
  updateEmail, 
  updatePassword 
} from 'firebase/auth';
import { auth, database } from '../firebase';
import { ref, set, update } from 'firebase/database';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await set(ref(database, 'users/' + userCredential.user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
        habits: []
      });
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function updateUserEmail(email) {
    try {
      await updateEmail(auth.currentUser, email);
      await update(ref(database, 'users/' + auth.currentUser.uid), { email });
    } catch (error) {
      throw error;
    }
  }

  async function updateUserPassword(password) {
    return updatePassword(auth.currentUser, password);
  }

  async function updateUserProfile(name) {
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      await update(ref(database, 'users/' + auth.currentUser.uid), { name });
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [auth]);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    updateUserEmail,
    updateUserPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
