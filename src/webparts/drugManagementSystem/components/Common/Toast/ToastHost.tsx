import * as React from 'react';
import { getToastEventName, type ToastPayload, type ToastType } from './toastBus';

type ToastItem = ToastPayload & { id: string };

const getAccent = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return '#4CAF50';
    case 'error':
      return '#F44336';
    case 'warning':
      return '#FF9800';
    case 'info':
    default:
      return '#1E88E5';
  }
};

export const ToastHost: React.FC = () => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    const handler = (evt: Event) => {
      const custom = evt as CustomEvent<ToastPayload>;
      const payload = custom.detail;
      if (!payload?.message) return;
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const durationMs = payload.durationMs ?? 3500;

      const item: ToastItem = { ...payload, id, durationMs };
      setToasts((prev) => [item, ...prev].slice(0, 5));

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, durationMs);
    };

    window.addEventListener(getToastEventName(), handler as any);
    return () => window.removeEventListener(getToastEventName(), handler as any);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 100000,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 420
      }}
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((t) => {
        const accent = getAccent(t.type);
        return (
          <div
            key={t.id}
            style={{
              background: '#fff',
              border: '1px solid #edebe9',
              borderLeft: `5px solid ${accent}`,
              borderRadius: 8,
              boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
              padding: '10px 12px'
            }}
          >
            {t.title ? (
              <div style={{ fontWeight: 700, marginBottom: 4, color: '#201f1e' }}>{t.title}</div>
            ) : null}
            <div style={{ fontSize: 13, color: '#323130', wordBreak: 'break-word' }}>{t.message}</div>
          </div>
        );
      })}
    </div>
  );
};

