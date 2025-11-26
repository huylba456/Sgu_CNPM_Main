import { createContext, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const ProductsContext = createContext();

const generateId = (prefix) => (crypto?.randomUUID ? crypto.randomUUID() : `${prefix}-${Math.random().toString(36).slice(2, 10)}`);
const defaultProductImage = 'foodfast-placeholder.svg';
const fallbackCategories = ['Burger', 'Sushi', 'Pizza', 'Healthy', 'Dessert', 'Pasta', 'Drink'];

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);

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

  const resolveDocId = (id) => products.find((item) => item.id === id || item.code === id || item.docId === id)?.id ?? id;

  const addProduct = async (payload) => {
    const newProduct = {
      rating: payload.rating ?? 4.5,
      deliveryTime: payload.deliveryTime ?? 15,
      ...payload,
      price: Number(payload.price ?? 0),
      image: payload.image || defaultProductImage
    };
    const docRef = await addDoc(collection(db, 'products'), newProduct);
    return { id: docRef.id, ...newProduct };
  };

  const updateProduct = async (id, updates) => {
    const docId = resolveDocId(id);
    await updateDoc(doc(db, 'products', docId), { ...updates, image: updates.image || defaultProductImage });
  };

  const deleteProduct = async (id) => {
    const docId = resolveDocId(id);
    await deleteDoc(doc(db, 'products', docId));
  };

  const value = useMemo(
    () => ({
      products,
      categories: fallbackCategories,
      addProduct,
      updateProduct,
      deleteProduct
    }),
    [products]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};
