import { createSOS } from '../api/requests';
import { getQueuedSOS, removeQueuedSOS } from './db';

export const SOS_SENT_EVENT = 'ezdoc:queued-sos-sent';

let flushing = null;

/**
 * Send every SOS queued while offline, oldest first.
 * - Sent successfully      -> removed from the queue, reported in `sent`
 * - Rejected by the server -> removed (retrying won't help), reported in `failed`
 * - Network still down     -> stop and keep the rest for the next attempt
 * Concurrent calls share one run so an SOS is never sent twice.
 */
export const flushSOSQueue = (send = createSOS) => {
    if (!flushing) {
        flushing = (async () => {
            const sent = [];
            const failed = [];
            for (const item of await getQueuedSOS()) {
                let result;
                try {
                    result = await send(item.payload, item.token);
                } catch {
                    break; // still offline
                }
                await removeQueuedSOS(item.id);
                (result.ok ? sent : failed).push({ item, data: result.data });
            }
            if (sent.length) {
                const latest = sent[sent.length - 1].data;
                sessionStorage.setItem('requestId', latest._id);
                window.dispatchEvent(new CustomEvent(SOS_SENT_EVENT, { detail: { sent, failed } }));
            }
            return { sent, failed };
        })().finally(() => { flushing = null; });
    }
    return flushing;
};
