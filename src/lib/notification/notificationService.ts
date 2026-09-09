// lib/notification/notificationService.ts
import { isValidElement, type ReactNode } from 'react';
import { Id, toast, ToastOptions, ToastPromiseParams, UpdateOptions } from 'react-toastify';

export type NotifyType = 'default' | 'success' | 'error' | 'info' | 'warning' | 'loading';

// Generic so `data` (and anything else parameterized by T) stays correctly
// typed all the way through to toast.promise<T> — a non-generic version
// silently collapses to ToastOptions<unknown>, which toast.promise rejects.
export interface NotifyOptions<T = unknown> extends ToastOptions<T> {
  dedupeKey?: string;
}

type NotifyContent = ReactNode | unknown;

const hash = (s: string) =>
  Array.from(s).reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0);

const normalizeMessage = (input: unknown): string => {
  if (Array.isArray(input)) {
    return input.filter(Boolean).map(String).join(' • ');
  }
  if (typeof input === 'object' && input !== null) {
    const anyObj = input as Record<string, unknown>;
    const fromMessage = anyObj.message;
    if (Array.isArray(fromMessage)) return fromMessage.filter(Boolean).map(String).join(' • ');
    if (typeof fromMessage === 'string') return fromMessage;

    const fromErrors = anyObj.errors;
    if (Array.isArray(fromErrors)) return fromErrors.filter(Boolean).map(String).join(' • ');
  }
  return String(input ?? '');
};

const resolveContent = (input: NotifyContent): { content: ReactNode; dedupeSeed: string } => {
  if (isValidElement(input)) {
    return {
      content: input,
      dedupeSeed: input.key ? String(input.key) : JSON.stringify(input.props ?? {}),
    };
  }
  const msg = normalizeMessage(input).trim();
  return { content: msg, dedupeSeed: msg };
};

// Strips `dedupeKey` (our own addition, not a react-toastify option) without
// ever binding it to a named variable, so there's nothing for
// no-unused-vars to flag.
const stripDedupeKey = <T>(opts?: NotifyOptions<T>): ToastOptions<T> => {
  if (!opts) return {};
  const rest: Record<string, unknown> = { ...opts };
  delete rest.dedupeKey;
  return rest as ToastOptions<T>;
};

const showToast = (
  type: NotifyType,
  rawMsg: NotifyContent,
  opts?: NotifyOptions
): Id | undefined => {
  const { content, dedupeSeed } = resolveContent(rawMsg);
  if (!content) return;

  const key = opts?.dedupeKey ?? dedupeSeed;
  const id = (opts?.toastId ?? `t-${hash(`${type}:${key}`)}`) as Id;

  if (toast.isActive(id)) return id;

  const finalOpts: ToastOptions = { ...stripDedupeKey(opts), toastId: id };

  switch (type) {
    case 'default':
      return toast(content, finalOpts);
    case 'success':
      return toast.success(content, finalOpts);
    case 'error':
      return toast.error(content, finalOpts);
    case 'info':
      return toast.info(content, finalOpts);
    case 'warning':
      return toast.warning(content, finalOpts);
    case 'loading':
      // loading toasts don't auto-close by default — caller should
      // follow up with dismiss() or update() once the task finishes
      return toast.loading(content, { autoClose: false, ...finalOpts });
  }
};

// ── Promise toasts take the Promise itself + separate pending/success/error
// messages — a different shape from the rest, so they get their own path.

export type NotifyPromiseMessages<T = unknown> = ToastPromiseParams<T, unknown, unknown>;

const showPromise = <T>(
  promise: Promise<T> | (() => Promise<T>),
  messages: NotifyPromiseMessages<T>,
  opts?: NotifyOptions<T>
): Promise<T> => {
  const toastOpts = stripDedupeKey<T>(opts);
  return toast.promise<T>(promise, messages, toastOpts);
};

export interface Notifier {
  default: (msg: NotifyContent, opts?: NotifyOptions) => Id | undefined;
  success: (msg: NotifyContent, opts?: NotifyOptions) => Id | undefined;
  error: (msg: NotifyContent, opts?: NotifyOptions) => Id | undefined;
  info: (msg: NotifyContent, opts?: NotifyOptions) => Id | undefined;
  warning: (msg: NotifyContent, opts?: NotifyOptions) => Id | undefined;
  /** @deprecated use `warning` — kept as an alias for existing call sites */
  warn: (msg: NotifyContent, opts?: NotifyOptions) => Id | undefined;
  loading: (msg: NotifyContent, opts?: NotifyOptions) => Id | undefined;
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    messages: NotifyPromiseMessages<T>,
    opts?: NotifyOptions<T>
  ) => Promise<T>;
  /** Manually resolve a `loading` toast into a final state. */
  update: (id: Id, options: UpdateOptions) => void;
  /** Dismiss a specific toast, or every toast if no id is given. */
  dismiss: (id?: Id) => void;
  isActive: (id: Id) => boolean;
}

/**
 * Scoped notifier factory. Give a feature/page its own defaults
 * (autoClose speed, position, icon, className...) without touching
 * the global ToastContainer or any other page's behavior.
 * Per-call opts always win over these defaults.
 */
export const createNotifier = (defaults: NotifyOptions = {}): Notifier => ({
  default: (msg, opts) => showToast('default', msg, { ...defaults, ...opts }),
  success: (msg, opts) => showToast('success', msg, { ...defaults, ...opts }),
  error: (msg, opts) => showToast('error', msg, { ...defaults, ...opts }),
  info: (msg, opts) => showToast('info', msg, { ...defaults, ...opts }),
  warning: (msg, opts) => showToast('warning', msg, { ...defaults, ...opts }),
  warn: (msg, opts) => showToast('warning', msg, { ...defaults, ...opts }),
  loading: (msg, opts) => showToast('loading', msg, { ...defaults, ...opts }),
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    messages: NotifyPromiseMessages<T>,
    opts?: NotifyOptions<T>
  ) => showPromise<T>(promise, messages, { ...defaults, ...opts } as NotifyOptions<T>),
  update: (id, options) => toast.update(id, options),
  dismiss: (id) => toast.dismiss(id),
  isActive: (id) => toast.isActive(id),
});

// Project-wide default notifier — drop-in replacement for existing `notify.x(...)` call sites.
export const notify = createNotifier();
