import { useSyncExternalStore } from 'react';

const subscribe = (callback) => {
    window.addEventListener('online', callback);
    window.addEventListener('offline', callback);
    return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
    };
};

/** true while the browser reports a network connection. */
const useOnlineStatus = () => useSyncExternalStore(subscribe, () => navigator.onLine, () => true);

export default useOnlineStatus;
