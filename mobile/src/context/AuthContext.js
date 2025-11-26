import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const next = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setUserList(next);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    const latest = userList.find((item) => item.id === user.id);
    if (latest?.status === 'inactive') {
      setUser(null);
    }
  }, [user, userList]);

  const login = useCallback(
    (email, password) => {
      const found = userList.find((item) => item.email === email && item.password === password);
      if (found && found.status === 'inactive') {
        return { success: false, message: 'Tài khoản đã bị khóa' };
      }
      if (found) {
        setUser(found);
        return { success: true, user: found };
      }
      return { success: false, message: 'Thông tin đăng nhập không chính xác' };
    },
    [userList]
  );

  const logout = useCallback(() => setUser(null), []);

  const register = useCallback(
    async ({ name, email, password, phone = '', address = '' }) => {
      const isExisting = userList.some((item) => item.email === email);
      if (isExisting) {
        return { success: false, message: 'Email đã được đăng ký' };
      }

      const newUser = {
        name,
        email,
        password,
        role: 'customer',
        phone,
        address,
        status: 'active'
      };

      const docRef = await addDoc(collection(db, 'users'), newUser);
      const created = { ...newUser, id: docRef.id };
      setUser(created);
      return { success: true, user: created };
    },
    [userList]
  );

  const value = useMemo(
    () => ({
      user,
      users: userList,
      login,
      logout,
      register,
      setUserList,
      updateUser: async (id, updates) => {
        await updateDoc(doc(db, 'users', id), updates);
        setUser((current) => (current?.id === id ? { ...current, ...updates } : current));
      }
    }),
    [user, userList, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
