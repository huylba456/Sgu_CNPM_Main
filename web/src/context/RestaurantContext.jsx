import { createContext, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config.js';

export const RestaurantContext = createContext();

const defaultRestaurantImage = '/images/foodfast-placeholder.svg';

export const RestaurantProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'restaurants'), (snapshot) => {
      const next = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setRestaurants(next.map((restaurant) => ({ ...restaurant, image: restaurant.image || defaultRestaurantImage })));
    });

    return unsubscribe;
  }, []);

  const addRestaurant = async ({ name, address = '', contact = '', dronePad = '', image = '' }) => {
    const newRestaurant = {
      name: name.trim(),
      address: address.trim(),
      contact: contact.trim(),
      dronePad: dronePad.trim(),
      image: image.trim() || defaultRestaurantImage,
      revenue: 0
    };

    const docRef = await addDoc(collection(db, 'restaurants'), newRestaurant);
    return { id: docRef.id, ...newRestaurant };
  };

  const value = useMemo(() => ({ restaurants, addRestaurant }), [restaurants]);

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
};
