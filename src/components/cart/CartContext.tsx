"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cartCount, type CartItem } from "@/lib/cart";

// v2: las líneas pasaron de un único `meters` a `widthM` + `heightM`. Cambiar la
// clave descarta los carritos viejos en vez de mostrarlos con medidas vacías.
const STORAGE_KEY = "cn_cart_v2";

interface CartContextValue {
  items: CartItem[];
  /** Suma de cantidades de todas las líneas. */
  count: number;
  /** `true` una vez leído localStorage: evita parpadeo/hidratación incorrecta. */
  hydrated: boolean;
  /** Contador de "agregados" — se incrementa en cada add para animar el badge. */
  bump: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<Omit<CartItem, "id">>) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [bump, setBump] = useState(0);
  // Evita escribir en localStorage antes de haber leído el valor inicial.
  const loaded = useRef(false);

  // Carga inicial desde localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed as CartItem[]);
      }
    } catch {
      /* localStorage no disponible o JSON corrupto: se ignora. */
    }
    loaded.current = true;
    setHydrated(true);
  }, []);

  // Persiste en cada cambio (una vez cargado el valor inicial).
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* cuota llena o modo privado: se ignora. */
    }
  }, [items]);

  // Sincroniza entre pestañas.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : [];
        if (Array.isArray(parsed)) setItems(parsed as CartItem[]);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    setItems((prev) => [...prev, { ...item, id: newId() }]);
    setBump((b) => b + 1);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const updateItem = useCallback(
    (id: string, patch: Partial<Omit<CartItem, "id">>) => {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      );
    },
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: cartCount(items),
      hydrated,
      bump,
      addItem,
      removeItem,
      updateItem,
      clear,
    }),
    [items, hydrated, bump, addItem, removeItem, updateItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
