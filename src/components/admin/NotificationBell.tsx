"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Check, FileText, Package, RefreshCw } from "lucide-react";
import type { NotificationType } from "@/lib/notifications";
import { cn } from "@/lib/utils";

export type BellItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  /** Ya formateada en el servidor: evita desajustes de zona horaria al hidratar. */
  when: string;
};

const ICONS: Record<NotificationType, typeof Bell> = {
  COTIZACION: FileText,
  PEDIDO: Package,
  ESTADO: RefreshCw,
};

/**
 * Campana de notificaciones del panel.
 *
 * Recibe las notificaciones ya resueltas desde el layout (Server Component) y
 * delega el marcado de leídas en Server Actions. Mantiene una copia local del
 * estado leído para que el globo reaccione al instante sin esperar al servidor.
 */
export function NotificationBell({
  items,
  unread,
  onMarkAllRead,
  onMarkRead,
}: {
  items: BellItem[];
  unread: number;
  onMarkAllRead: () => Promise<void>;
  onMarkRead: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isRead = (it: BellItem) => it.read || readIds.has(it.id);
  const pending = items.filter((it) => !isRead(it)).length;
  // `unread` puede contar más de las que se listan (la campana muestra las últimas).
  const badgeCount = Math.max(0, unread - readIds.size);
  const showBadge = badgeCount > 0 || pending > 0;

  function markAll() {
    setReadIds(new Set(items.map((it) => it.id)));
    startTransition(() => {
      void onMarkAllRead();
    });
  }

  function openItem(it: BellItem) {
    if (!isRead(it)) {
      setReadIds((prev) => new Set(prev).add(it.id));
      startTransition(() => {
        void onMarkRead(it.id);
      });
    }
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notificaciones${showBadge ? `, ${badgeCount} sin leer` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-cloud transition-colors hover:bg-ink"
      >
        <Bell className="h-5 w-5" />
        {showBadge && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-morado to-naranja px-1 text-[10px] font-bold text-white ring-2 ring-surface">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="card-premium absolute right-0 top-full z-50 mt-2 w-[min(92vw,22rem)] origin-top-right overflow-hidden p-0"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-cloud">Notificaciones</p>
              {showBadge && (
                <button
                  type="button"
                  onClick={markAll}
                  className="inline-flex items-center gap-1 text-xs text-mist transition-colors hover:text-cloud"
                >
                  <Check className="h-3.5 w-3.5" /> Marcar todas
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto h-7 w-7 text-mist-2" />
                <p className="mt-3 text-sm text-mist">Sin notificaciones por ahora.</p>
                <p className="mt-1 text-xs text-mist-2">
                  Aquí te avisamos cuando entre una cotización o un pedido.
                </p>
              </div>
            ) : (
              <ul className="max-h-[min(60vh,24rem)] divide-y divide-line/70 overflow-y-auto">
                {items.map((it) => {
                  const Icon = ICONS[it.type] ?? Bell;
                  const read = isRead(it);
                  const inner = (
                    <div className="flex gap-3">
                      <span
                        className={cn(
                          "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                          read ? "bg-ink text-mist-2" : "bg-morado/15 text-morado-light",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm",
                            read ? "text-mist" : "font-medium text-cloud",
                          )}
                        >
                          {it.title}
                        </p>
                        {it.body && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-mist-2">{it.body}</p>
                        )}
                        <p className="mt-1 text-[11px] text-mist-2">{it.when}</p>
                      </div>
                      {!read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-naranja" />
                      )}
                    </div>
                  );

                  return (
                    <li key={it.id}>
                      {it.href ? (
                        <Link
                          href={it.href}
                          onClick={() => openItem(it)}
                          className="block px-4 py-3 transition-colors hover:bg-ink"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openItem(it)}
                          className="block w-full px-4 py-3 text-left transition-colors hover:bg-ink"
                        >
                          {inner}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
