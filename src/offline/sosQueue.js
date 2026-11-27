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
async function sendAllQueued(send) {
    const sent = [];
    const failed = [];
    const queued = await getQueuedSOS();

    for (const item of queued) {
        let result;
        try {
            result = await send(item.payload, item.token);
        } catch {
            break; // still offline: keep this one and the rest for next time
        }
        await removeQueuedSOS(item.id);

        const outcome = { item: item, data: result.data };
        if (result.ok) {
            sent.push(outcome);
        } else {
            failed.push(outcome);
        }
    }

    if (sent.length > 0) {
        // Track the newest SOS on the tracking page, and tell the rest of the app
        const latest = sent[sent.length - 1].data;
        sessionStorage.setItem('requestId', latest._id);
        window.dispatchEvent(new CustomEvent(SOS_SENT_EVENT, { detail: { sent, failed } }));
    }
    return { sent, failed };
}

export const flushSOSQueue = (send = createSOS) => {
    // Already running? Return the same run, so an SOS is never sent twice
    if (!flushing) {
        flushing = sendAllQueued(send).finally(() => {
            flushing = null; // finished: the next call may start a new run
        });
    }
    return flushing;
};
