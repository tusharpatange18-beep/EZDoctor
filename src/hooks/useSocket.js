import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

/**
 * useSocket
 * Connects to the Socket.io server and registers event listeners.
 * Automatically disconnects on component unmount.
 *
 * @param {Object} handlers - { eventName: callbackFn }
 * @example
 *   useSocket({
 *     requestUpdate: (data) => setRequests(...),
 *     locationUpdate: (data) => setLocation(...),
 *   });
 */
const useSocket = (handlers = {}) => {
    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = io(SOCKET_URL);

        Object.entries(handlers).forEach(([event, handler]) => {
            socketRef.current.on(event, handler);
        });

        return () => {
            socketRef.current?.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return socketRef;
};

export default useSocket;
