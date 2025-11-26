import { createContext, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { useRestaurants } from '../hooks/useRestaurants.js';

const fallbackCategories = ['Burger', 'Sushi', 'Pizza', 'Healthy', 'Dessert', 'Pasta', 'Drink'];

export const DataContext = createContext();

const generateId = (prefix) =>
  crypto?.randomUUID ? crypto.randomUUID() : `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const defaultProductImage = '/images/foodfast-placeholder.svg';

export const DataProvider = ({ children }) => {
  const { restaurants } = useRestaurants();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [drones, setDrones] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const next = snapshot.docs.map((item) => {
        const { id: code, ...data } = item.data();
        return { id: item.id, code: code ?? item.id, ...data };
      });
      setProducts(next.map((product) => ({ ...product, image: product.image || defaultProductImage })));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const next = snapshot.docs
        .map((item) => {
          const { id: code, ...data } = item.data();
          return { id: item.id, code: code ?? item.id, ...data };
        })
        .sort((a, b) => new Date(b.placedAt ?? 0) - new Date(a.placedAt ?? 0));
      setOrders(next);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'drones'), (snapshot) => {
      const next = snapshot.docs.map((item) => {
        const { id: code, ...data } = item.data();
        return { id: item.id, code: code ?? item.id, ...data };
      });
      setDrones(next);
    });

    return unsubscribe;
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((item) => item.category).filter(Boolean)));
    return unique.length ? unique : fallbackCategories;
  }, [products]);

  const getRestaurantIdFromName = (restaurantName) =>
    restaurants.find((item) => item.name === restaurantName)?.id ?? restaurants[0]?.id ?? 'r1';

  const activeDrones = useMemo(() => drones.filter((drone) => drone.status === 'Hoạt động'), [drones]);

  const resolveDocId = (list, id) => list.find((item) => item.id === id || item.code === id || item.docId === id)?.id ?? id;

  const normalizeDroneId = (droneId) => (droneId ? resolveDocId(drones, droneId) : null);

  const reserveDroneId = (existingOrders, preferredId) => {
    const inUse = new Set(
      existingOrders
        .filter((order) => order.status === 'shipping' && order.droneId)
        .map((order) => normalizeDroneId(order.droneId))
        .filter(Boolean)
    );

    const preferredDocId = normalizeDroneId(preferredId);
    if (preferredDocId && !inUse.has(preferredDocId)) return preferredDocId;

    const available = activeDrones.find((drone) => !inUse.has(drone.id));
    return available?.id ?? null;
  };

  const addProduct = async (payload) => {
    const code = payload.code ?? payload.id;
    const data = {
      rating: payload.rating ?? 4.5,
      deliveryTime: payload.deliveryTime ?? 15,
      ...payload,
      price: Number(payload.price ?? 0),
      image: payload.image || defaultProductImage,
      ...(code ? { code } : {})
    };
    const docRef = await addDoc(collection(db, 'products'), data);
    return { id: docRef.id, ...data };
  };

  const updateProduct = async (id, updates) => {
    const docId = resolveDocId(products, id);
    await updateDoc(doc(db, 'products', docId), {
      ...updates,
      image: updates.image || defaultProductImage
    });
  };

  const deleteProduct = async (id) => {
    const docId = resolveDocId(products, id);
    await deleteDoc(doc(db, 'products', docId));
  };

  const addOrder = async (payload) => {
    const { items = [] } = payload;
    const restaurantId = payload.restaurantId ?? getRestaurantIdFromName(items[0]?.restaurant);
    const droneId = payload.status === 'shipping' ? reserveDroneId(orders, payload.droneId) : null;
    const code = payload.code ?? payload.id;

    const newOrder = {
      status: 'pending',
      note: payload.note ?? '',
      placedAt: new Date().toISOString(),
      ...payload,
      restaurantId,
      droneId,
      ...(code ? { code } : {})
    };

    const docRef = await addDoc(collection(db, 'orders'), newOrder);
    return { id: docRef.id, ...newOrder };
  };

  const updateOrder = async (id, updates) => {
    const docId = resolveDocId(orders, id);
    const shippingAssignments = new Set(
      orders
        .filter((order) => order.id !== docId && order.status === 'shipping' && order.droneId)
        .map((order) => normalizeDroneId(order.droneId))
        .filter(Boolean)
    );

    const currentOrder = orders.find((order) => order.id === docId || order.code === id);
    const nextStatus = updates.status ?? currentOrder?.status;
    const requestedDroneId = normalizeDroneId(updates.droneId ?? currentOrder?.droneId);
    const shouldAssignDrone = nextStatus === 'shipping' && !requestedDroneId;
    const safeDroneId =
      shouldAssignDrone || (requestedDroneId && shippingAssignments.has(requestedDroneId))
        ? reserveDroneId(orders.filter((order) => order.id !== docId), requestedDroneId)
        : requestedDroneId;

    await updateDoc(doc(db, 'orders', docId), { ...updates, droneId: safeDroneId });
  };

  const addDrone = async (payload) => {
    const code = payload.code ?? payload.id ?? generateId('drone');
    const data = {
      status: payload.status ?? 'Hoạt động',
      battery: payload.battery ?? 100,
      dailyDeliveries: payload.dailyDeliveries ?? 0,
      totalDeliveries: payload.totalDeliveries ?? 0,
      distance: payload.distance ?? 0,
      code
    };
    const docRef = await addDoc(collection(db, 'drones'), data);
    return { ...data, id: docRef.id };
  };

  const updateDrone = async (id, updates) => {
    const docId = resolveDocId(drones, id);
    await updateDoc(doc(db, 'drones', docId), updates);
  };

  const deleteDrone = async (id) => {
    const docId = resolveDocId(drones, id);
    await deleteDoc(doc(db, 'drones', docId));
  };

  const value = useMemo(
    () => ({
      products,
      categories,
      orders,
      drones,
      addProduct,
      updateProduct,
      deleteProduct,
      addOrder,
      updateOrder,
      addDrone,
      updateDrone,
      deleteDrone
    }),
    [products, categories, orders, drones]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
