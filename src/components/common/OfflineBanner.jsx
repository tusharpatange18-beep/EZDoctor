import { useEffect, useState } from 'react';
import { WifiOff, CheckCircle } from 'lucide-react';
import useOnlineStatus from '../../hooks/useOnlineStatus';

// Loaded on demand so IndexedDB code stays out of the first-paint bundle
const flushSOSQueue = () => import('../../offline/sosQueue').then(m => m.flushSOSQueue());

/**
 * Shows an offline banner and, when the connection comes back, sends any SOS
 * that was queued while offline.
 */
const OfflineBanner = () => {
    const online = useOnlineStatus();
    const [notice, setNotice] = useState('');

    useEffect(() => {
        if (!online) return;
        let cancelled = false;
        flushSOSQueue().then(({ sent }) => {
            if (cancelled || !sent.length) return;
            setNotice(`Back online: ${sent.length === 1 ? 'your saved SOS was' : `${sent.length} saved SOS requests were`} sent.`);
            setTimeout(() => setNotice(''), 6000);
        });
        return () => { cancelled = true; };
    }, [online]);

    return (
        <div role="status" aria-live="polite">
            {!online && (
                <div className="bg-gray-900 text-white text-sm px-4 py-2 flex items-center justify-center gap-2">
                    <WifiOff className="w-4 h-4" aria-hidden="true" />
                    You're offline. Saved pages still work, and an SOS will be sent as soon as you reconnect.
                </div>
            )}
            {online && notice && (
                <div className="bg-emerald-700 text-white text-sm px-4 py-2 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                    {notice}
                </div>
            )}
        </div>
    );
};

export default OfflineBanner;
