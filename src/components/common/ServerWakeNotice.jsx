import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { API_BASE } from '../../constants/status';

const HEALTH_URL = (API_BASE || '').replace(/\/api\/?$/, '/');
const SLOW_AFTER_MS = 2500;

/**
 * The backend runs on a free Render instance that sleeps when idle and takes
 * ~20-30 s to wake. Ping it as soon as the app loads (which also starts the
 * wake-up early) and, if it is slow, tell the user why instead of looking broken.
 */
const ServerWakeNotice = () => {
    const [waking, setWaking] = useState(false);

    useEffect(() => {
        if (!HEALTH_URL || !navigator.onLine) return;
        let done = false;
        const timer = setTimeout(() => { if (!done) setWaking(true); }, SLOW_AFTER_MS);
        fetch(HEALTH_URL)
            .catch(() => {})
            .finally(() => { done = true; clearTimeout(timer); setWaking(false); });
        return () => clearTimeout(timer);
    }, []);

    return (
        <div role="status" aria-live="polite">
            {waking && (
                <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm px-4 py-2 flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Waking up the server. The free hosting sleeps when idle, so the first load can take up to 30 seconds.
                </div>
            )}
        </div>
    );
};

export default ServerWakeNotice;
