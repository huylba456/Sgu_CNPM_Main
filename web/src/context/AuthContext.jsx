import { createContext, useCallback, useMemo, useState } from 'react';
import { users as seedUsers } from '../data/mockUsers.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userList, setUserList] = useState(seedUsers);

  const login = useCallback(
    (email, password) => {
      const found = userList.find((item) => item.email === email && item.password === password);
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
    ({ name, email, password, phone = '', address = '' }) => {
      const isExisting = userList.some((item) => item.email === email);
      if (isExisting) {
        return { success: false, message: 'Email đã được đăng ký' };
      }

      const newUser = {
        id: crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 11),
        name,
        email,
        password,
        role: 'customer',
        phone,
        address
      };

      setUserList((prev) => [...prev, newUser]);
      setUser(newUser);
      return { success: true, user: newUser };
    },
    [userList]
  );

  const value = useMemo(() => ({ user, login, logout, register }), [user, login, logout, register]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
