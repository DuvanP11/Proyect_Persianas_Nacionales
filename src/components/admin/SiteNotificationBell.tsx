"use client";

import { useCallback, useEffect, useState } from "react";
import { NotificationBell, type BellItem } from "./NotificationBell";

/**
 * Campana para el admin y los asesores dentro del sitio público.
 *
 * Solo se pinta si hay sesión de staff, cosa que decide el servidor en
 * `/api/notificaciones`: el Navbar es un Client Component y no puede leer la
 * cookie httpOnly. Para un visitante normal no se renderiza nada.
 *
 * Se refresca al volver a la pestaña, que es cuando el asesor quiere ver si
 * entró algo mientras no miraba.
 */
export function SiteNotificationBell() {
  const [state, setState] = useState<{ items: BellItem[]; unread: number } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notificaciones", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setState(data.staff ? { items: data.items, unread: data.unread } : null);
    } catch {
      /* sin red o sesión caída: la campana simplemente no aparece. */
    }
  }, []);

  useEffect(() => {
    void load();
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  if (!state) return null;

  return (
    <NotificationBell
      items={state.items}
      unread={state.unread}
      onMarkAllRead={async () => {
        await fetch("/api/notificaciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "all" }),
        });
        await load();
      }}
      onMarkRead={async (id) => {
        await fetch("/api/notificaciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "one", id }),
        });
        await load();
      }}
    />
  );
}
