import { createContext, useContext } from 'react';

export const AuthContext = createContext<string | null>(null);
export const useAuthToken = () => useContext(AuthContext);
