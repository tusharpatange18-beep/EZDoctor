import { useEffect, useState, useRef, useCallback } from 'react';

// ─────────────────────────────────────────────────────
// Toast type config
// ─────────────────────────────────────────────────────
const TYPES = {
    success: { icon: '✅', border: 'border-l-emerald-500', iconBg: 'bg-emerald-50', text: 'text-emerald-700' },
    error:   { icon: '❌', border: 'border-l-red-500',     iconBg: 'bg-red-50',     text: 'text-red-700'     },
    info:    { icon: 'ℹ️',  border: 'border-l-blue-500',   iconBg: 'bg-blue-50',    text: 'text-blue-700'    },
    warning: { icon: '⚠️', border: 'border-l-amber-500',  iconBg: 'bg-amber-50',   text: 'text-amber-700'   },
};

const PROGRESS_COLORS = {
    success: 'bg-emerald-500',
    error:   'bg-red-500',
    info:    'bg-blue-500',
    warning: 'bg-amber-500',
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

// ─────────────────────────────────────────────────────
// Single Toast item
// ─────────────────────────────────────────────────────
const ToastItem = ({ toast, onRemove }) => {
    const { icon, border, iconBg, text } = TYPES[toast.type] || TYPES.info;
    const progressColor = PROGRESS_COLORS[toast.type] || PROGRESS_COLORS.info;
    const duration = toast.duration || 3500;

    const [width, setWidth] = useState(100);
    const [leaving, setLeaving] = useState(false);
    const intervalRef = useRef(null);

    const dismiss = useCallback(() => {
        setLeaving(true);
        setTimeout(() => onRemove(toast.id), 300);
    }, [onRemove, toast.id]);

    useEffect(() => {
        const step = 100 / (duration / 50);
        intervalRef.current = setInterval(() => {
            setWidth(w => {
                if (w <= 0) { clearInterval(intervalRef.current); return 0; }
                return w - step;
            });
        }, 50);
        const timer = setTimeout(dismiss, duration);
        return () => {
            clearInterval(intervalRef.current);
            clearTimeout(timer);
        };
    }, [dismiss, duration]);

    return (
        <div
            className={`relative bg-white rounded-xl shadow-lg border border-gray-100 border-l-4 overflow-hidden
                        min-w-[300px] max-w-sm transition-all duration-300
                        ${border} ${leaving ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0 animate-toast-in'}`}
        >
            {/* Progress bar */}
            <div
                className={`absolute bottom-0 left-0 h-0.5 ${progressColor}`}
                style={{ width: `${width}%`, transition: 'width 50ms linear' }}
            />

            <div className="flex items-start gap-3 p-3.5 pr-4">
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base ${iconBg}`}>
                    {icon}
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0 pt-0.5">
                    <p className={`text-sm font-semibold ${text}`}>
                        {toast.title || capitalize(toast.type)}
                    </p>
                    {toast.message && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{toast.message}</p>
                    )}
                </div>

                {/* Close */}
                <button
                    onClick={dismiss}
                    className="text-gray-300 hover:text-gray-500 transition text-sm mt-0.5 flex-shrink-0"
                    aria-label="Dismiss"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────
// ToastContainer — standalone named export (fixes HMR)
// ─────────────────────────────────────────────────────
export const ToastContainer = ({ toasts, removeToast }) => {
    if (!toasts || toasts.length === 0) return null;
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 items-end">
            {toasts.map(t => (
                <ToastItem key={t.id} toast={t} onRemove={removeToast} />
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────────────
// useToast hook
// Usage:
//   const { showToast, toasts, removeToast } = useToast();
//   <ToastContainer toasts={toasts} removeToast={removeToast} />
//
// showToast("message", "success")
// showToast({ title: "Title", message: "Body", type: "error" })
// ─────────────────────────────────────────────────────
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((messageOrObj, type = 'info', duration = 3500) => {
        const id = Date.now() + Math.random();
        if (typeof messageOrObj === 'string') {
            setToasts(prev => [...prev, { id, message: messageOrObj, type, duration }]);
        } else {
            setToasts(prev => [...prev, { id, duration: 3500, ...messageOrObj }]);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { showToast, toasts, removeToast };
};

export default ToastContainer;
