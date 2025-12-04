import { createContext, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const RestaurantContext = createContext();

const defaultRestaurantImage = 'foodfast-placeholder.svg';

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

  const deleteRestaurant = async (id) => {
    const restaurant = restaurants.find((item) => item.id === id);

    if (!restaurant) {
      throw new Error('Không tìm thấy nhà hàng để xóa.');
    }

    const [ordersSnapshot, productsByNameSnapshot, productsByIdSnapshot] = await Promise.all([
      getDocs(query(collection(db, 'orders'), where('restaurantId', '==', id))),
      getDocs(query(collection(db, 'products'), where('restaurant', '==', restaurant.name))),
      getDocs(query(collection(db, 'products'), where('restaurantId', '==', id)))
    ]);

    const linkedProductIds = new Set([
      ...productsByNameSnapshot.docs.map((doc) => doc.id),
      ...productsByIdSnapshot.docs.map((doc) => doc.id)
    ]);

    const orderCount = ordersSnapshot.size;
    const productCount = linkedProductIds.size;

    if (orderCount || productCount) {
      const issues = [];
      if (orderCount) issues.push(`${orderCount} đơn hàng`);
      if (productCount) issues.push(`${productCount} món ăn`);
      throw new Error(
        `Không thể xóa nhà hàng khi còn dữ liệu liên quan. Vui lòng xóa trước:\n${issues.join('\n')}`
      );
    }

    await deleteDoc(doc(db, 'restaurants', id));
  };

  const value = useMemo(() => ({ restaurants, addRestaurant, deleteRestaurant }), [restaurants]);

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
};
