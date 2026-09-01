import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
  if (existing) {
    return new Promise((resolve) => existing.addEventListener("load", () => resolve(), { once: true }));
  }
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.addEventListener("load", () => resolve(), { once: true });
    document.head.appendChild(s);
  });
}

type Props = {
  siteKey: string;
  action?: string;
  onToken: (token: string) => void;
  /** Increase to force a fresh challenge (tokens zijn eenmalig) */
  resetKey?: number;
};

export function TurnstileWidget({ siteKey, action, onToken, resetKey = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    let cancelled = false;
    loadScript().then(() => {
      if (cancelled || !ref.current || !window.turnstile) return;
      ref.current.innerHTML = "";
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        action,
        callback: (token: string) => cb.current(token),
        "expired-callback": () => cb.current(""),
        "error-callback": () => cb.current(""),
        theme: "auto",
        size: "flexible",
      });
    });
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* widget al opgeruimd */
        }
        widgetId.current = null;
      }
    };
  }, [siteKey, action, resetKey]);

  return <div ref={ref} className="mt-3 flex justify-center" />;
}
