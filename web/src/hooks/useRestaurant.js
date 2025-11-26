import { useContext } from 'react';
import { RestaurantContext } from '../context/RestaurantContext.jsx';

export const useRestaurants = () => useContext(RestaurantContext);
