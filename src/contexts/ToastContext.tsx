"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ToastType = "success" | "warning" | "error" | "info";

export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  createdAt: number;
};

type ToastContextValue = {
  toasts: Toast[];
  addToast: (type: ToastType, title: string, description?: string) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 3500;
const MAX_VISIBLE = 3;

function ToastContextProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const createdAt = Date.now();
      setToasts((prev) => {
        const next = [...prev, { id, type, title, description, createdAt }];
        return next.slice(-8);
      });
      setTimeout(() => removeToast(id), AUTO_DISMISS_MS);
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastList />
    </ToastContext.Provider>
  );
}

function ToastList() {
  const { toasts, removeToast } = useContext(ToastContext)!;
  const visible = toasts.slice(-MAX_VISIBLE);

  return (
    <div
      className="vrtl-app fixed bottom-4 right-4 z-[100] flex max-h-[calc(100vh-2rem)] w-full max-w-sm flex-col gap-2 overflow-hidden"
      aria-live="polite"
    >
      {visible.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

const typeStyles: Record<ToastType, { border: string; bg?: string }> = {
  success: { border: "border-l-authority-dominant" },
  warning: { border: "border-l-authority-watchlist" },
  error: { border: "border-l-authority-losing" },
  info: { border: "border-l-authority-stable" },
};

function ToastItem({ toast }: { toast: Toast }) {
  const style = typeStyles[toast.type];
  return (
    <div
      role="alert"
      className={`toast-enter rounded-app border border-white/5 border-l-4 bg-[#1A1F26] px-4 py-3 ${style.border}`}
    >
      <div className="font-medium text-[#E6EAF0]">{toast.title}</div>
      {toast.description ? (
        <div className="mt-0.5 text-sm text-[#9CA3AF]">{toast.description}</div>
      ) : null}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastContextProvider");
  return ctx;
}

export { ToastContextProvider };
