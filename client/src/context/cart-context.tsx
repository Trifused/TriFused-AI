import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";

export interface CartItem {
  priceId: string;
  productId: string;
  productName: string;
  unitAmount: number;
  currency: string;
  type: "one_time" | "subscription";
  quantity: number;
  recurring?: { interval: string };
}

interface CartState {
  items: CartItem[];
  selectedSubscription: CartItem | null;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { priceId: string; quantity: number } }
  | { type: "SET_SUBSCRIPTION"; payload: CartItem | null }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE"; payload: CartState };

const CART_STORAGE_KEY = "trifused_cart";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex(
        (item) => item.priceId === action.payload.priceId
      );
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex].quantity += action.payload.quantity;
        return { ...state, items: newItems };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.priceId !== action.payload),
      };
    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.priceId !== action.payload.priceId),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.priceId === action.payload.priceId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case "SET_SUBSCRIPTION":
      return { ...state, selectedSubscription: action.payload };
    case "CLEAR_CART":
      return { items: [], selectedSubscription: null };
    case "HYDRATE":
      return action.payload;
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  selectedSubscription: CartItem | null;
  addItem: (item: CartItem) => void;
  removeItem: (priceId: string) => void;
  updateQuantity: (priceId: string, quantity: number) => void;
  setSubscription: (item: CartItem | null) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  hasSubscription: boolean;
  hasOneTimeItems: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    selectedSubscription: null,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch({ type: "HYDRATE", payload: parsed });
      }
    } catch (e) {
      console.error("Failed to hydrate cart:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to persist cart:", e);
    }
  }, [state]);

  const addItem = (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (priceId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: priceId });
  };

  const updateQuantity = (priceId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { priceId, quantity } });
  };

  const setSubscription = (item: CartItem | null) => {
    dispatch({ type: "SET_SUBSCRIPTION", payload: item });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0) + (state.selectedSubscription ? 1 : 0);

  const subtotal = state.items.reduce(
    (sum, item) => sum + item.unitAmount * item.quantity,
    0
  ) + (state.selectedSubscription?.unitAmount || 0);

  const hasSubscription = !!state.selectedSubscription;
  const hasOneTimeItems = state.items.length > 0;

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        selectedSubscription: state.selectedSubscription,
        addItem,
        removeItem,
        updateQuantity,
        setSubscription,
        clearCart,
        itemCount,
        subtotal,
        hasSubscription,
        hasOneTimeItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
