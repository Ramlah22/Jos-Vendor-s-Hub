import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const defaultContext = {
  currentUser: null,
  isAdmin: false,
  loading: true,
  login: async () => ({ success: false, error: 'Auth provider not initialized' }),
  logout: async () => {}
};

const AdminAuthContext = createContext(defaultContext);

export const useAdminAuth = () => {
  return useContext(AdminAuthContext);
};

export const AdminAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is admin
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            // If an explicit role field exists, verify it's admin; otherwise, trust presence in admins collection
            const hasAdminRole = adminData.role ? adminData.role === 'admin' : true;
            if (hasAdminRole) {
              setCurrentUser({ ...user, ...adminData });
              setIsAdmin(true);
            } else {
              setCurrentUser(null);
              setIsAdmin(false);
            }
          } else {
            setCurrentUser(null);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setCurrentUser(null);
          setIsAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user exists in admins collection
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        const hasAdminRole = adminData.role ? adminData.role === 'admin' : true;
        if (hasAdminRole) {
          setCurrentUser({ ...user, ...adminData });
          setIsAdmin(true);
          return { success: true };
        } else {
          await signOut(auth);
          return { success: false, error: 'Unauthorized: Admin access only' };
        }
      } else {
        await signOut(auth);
        return { success: false, error: 'Admin record not found' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    isAdmin,
    loading,
    login,
    logout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};
