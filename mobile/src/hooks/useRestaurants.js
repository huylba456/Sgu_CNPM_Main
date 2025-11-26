import { useContext } from 'react';
import { RestaurantContext } from '../context/RestaurantContext';

export const useRestaurants = () => useContext(RestaurantContext);
