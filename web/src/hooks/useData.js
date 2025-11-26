import { useContext } from 'react';
import { DataContext } from '../context/DataContext.jsx';

export const useData = () => useContext(DataContext);
