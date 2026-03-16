export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastPayload {
  type: ToastType;
  message: string;
  title?: string;
  durationMs?: number;
}

const EVENT_NAME = 'dms-toast';

export function showToast(payload: ToastPayload): void {
  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload }));
  } catch {
    // no-op (e.g. server-side render)
  }
}

export function getToastEventName(): string {
  return EVENT_NAME;
}

