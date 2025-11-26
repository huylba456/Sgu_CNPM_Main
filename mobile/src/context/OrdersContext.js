import { createContext, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useRestaurants } from '../hooks/useRestaurants';

export const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [drones, setDrones] = useState([]);
  const { restaurants } = useRestaurants();

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

  const activeDrones = useMemo(() => drones.filter((drone) => drone.status === 'Hoạt động'), [drones]);
  const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

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

    const available = activeDrones.filter((drone) => !inUse.has(drone.id));
    return available.length ? pickRandom(available)?.id ?? null : null;
  };

  const allowedTransitions = {
    pending: ['pending', 'preparing', 'cancelled'],
    preparing: ['preparing', 'shipping', 'cancelled'],
    shipping: ['shipping', 'delivered'],
    delivered: ['delivered'],
    cancelled: ['cancelled']
  };

  const validateStatus = (currentStatus, requestedStatus) => {
    if (!requestedStatus) return currentStatus;
    const allowed = allowedTransitions[currentStatus] ?? [currentStatus];
    return allowed.includes(requestedStatus) ? requestedStatus : currentStatus;
  };

  const generateId = () => `o-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const addOrder = async (payload) => {
    const { items = [] } = payload;
    const code = payload.code ?? payload.id ?? generateId();
    const { id: _ignoredId, ...restPayload } = payload;
    const restaurantId =
      restPayload.restaurantId ||
      restaurants.find((restaurant) => restaurant.name === items?.[0]?.restaurant)?.id ||
      restaurants[0]?.id ||
      'r1';

    const newOrder = {
      status: 'pending',
      note: payload.note ?? '',
      droneId: payload.status === 'shipping' ? reserveDroneId(orders, payload.droneId) : null,
      placedAt: new Date().toISOString(),
      ...restPayload,
      restaurantId,
      code
    };

    await addDoc(collection(db, 'orders'), newOrder);
  };

  const updateOrderStatus = async (id, status) => {
    const docId = resolveDocId(orders, id);
    const shippingAssignments = new Set(
      orders
        .filter((order) => order.id !== docId && order.status === 'shipping' && order.droneId)
        .map((order) => normalizeDroneId(order.droneId))
        .filter(Boolean)
    );

    const current = orders.find((order) => order.id === docId || order.code === id);
    const nextStatus = validateStatus(current?.status ?? 'pending', status);
    const shouldAssignDrone = nextStatus === 'shipping' && !current?.droneId;
    const hasConflict = current?.droneId && shippingAssignments.has(current.droneId);
    const droneId = shouldAssignDrone || hasConflict
      ? reserveDroneId(orders.filter((order) => order.id !== docId), current?.droneId)
      : normalizeDroneId(current?.droneId);

    await updateDoc(doc(db, 'orders', docId), { status: nextStatus, droneId });
  };

  const assignDrone = async (id, droneId) => {
    const docId = resolveDocId(orders, id);
    const inUse = new Set(
      orders
        .filter((order) => order.id !== docId && order.status === 'shipping' && order.droneId)
        .map((order) => normalizeDroneId(order.droneId))
        .filter(Boolean)
    );

    const normalizedDroneId = normalizeDroneId(droneId);
    const safeDroneId =
      normalizedDroneId && inUse.has(normalizedDroneId)
        ? reserveDroneId(orders.filter((order) => order.id !== docId), null)
        : normalizedDroneId;
    await updateDoc(doc(db, 'orders', docId), { droneId: safeDroneId });
  };

  const addOrderNote = async (id, note) => {
    const docId = resolveDocId(orders, id);
    await updateDoc(doc(db, 'orders', docId), { note });
  };

  const addDrone = async (payload) => {
    const code = payload.code ?? payload.id ?? `d-${Math.random().toString(36).slice(2, 8)}`;
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
      orders,
      drones,
      addOrder,
      updateOrderStatus,
      assignDrone,
      addOrderNote,
      addDrone,
      updateDrone,
      deleteDrone
    }),
    [orders, drones]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
};
  