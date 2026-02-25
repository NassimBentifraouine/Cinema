import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

let externalToast = null;

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
    const ctx = useContext(ToastContext);
    if (ctx) return ctx;
    // fallback for usage outside provider
    return { toast: externalToast || (() => { }) };
}

const icons = {
    success: <CheckCircle size={18} color="#22c55e" />,
    error: <AlertCircle size={18} color="var(--color-accent)" />,
    info: <Info size={18} color="#3b82f6" />,
};

export function Toaster() {
    const [toasts, setToasts] = useState([]);

    const toast = useCallback(({ message, type = 'info', duration = 3500 }) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
    }, []);

    // Expose globally
    useEffect(() => { externalToast = toast; }, [toast]);

    return (
        <ToastContext.Provider value={{ toast }}>
            <div
                style={{
                    position: 'fixed', bottom: '1.5rem', right: '1.5rem',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                    zIndex: 9999, maxWidth: '360px',
                }}
                role="region" aria-live="polite" aria-label="Notifications"
            >
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className="animate-fade-in glass"
                        style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                            padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        }}
                        role="alert"
                    >
                        {icons[t.type]}
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-100)', flex: 1, lineHeight: 1.4 }}>
                            {t.message}
                        </span>
                        <button
                            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                            aria-label="Fermer la notification"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)', padding: 0 }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
