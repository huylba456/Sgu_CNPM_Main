import { createContext, useMemo, useReducer } from 'react';

export const CartContext = createContext();

const initialState = {
  items: []
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload)
      };
    case 'UPDATE_QUANTITY': {
      const quantity = Math.max(1, action.payload.quantity);
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity } : item
        )
      };
    }
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(
    () => ({
      cartItems: state.items,
      addToCart: (product) => dispatch({ type: 'ADD_ITEM', payload: product }),
      removeFromCart: (id) => dispatch({ type: 'REMOVE_ITEM', payload: id }),
      updateQuantity: (id, quantity) =>
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
      clearCart: () => dispatch({ type: 'CLEAR' })
    }),
    [state.items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
