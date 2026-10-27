import { openDB } from 'idb';

/**
 * IndexedDB storage for offline use.
 *  - kv:       small cached values (last doctor search results)
 *  - sosQueue: SOS requests made while offline, sent when the connection returns
 */
const dbPromise = () =>
    openDB('ezdoc', 1, {
        upgrade(db) {
            db.createObjectStore('kv');
            db.createObjectStore('sosQueue', { keyPath: 'id', autoIncrement: true });
        },
    });

// ── Last doctor list ─────────────────────────────
export const saveDoctors = async (doctors) =>
    (await dbPromise()).put('kv', { doctors, savedAt: Date.now() }, 'doctors');

export const loadDoctors = async () => (await dbPromise()).get('kv', 'doctors') ?? null;

// ── Offline SOS queue ────────────────────────────
export const enqueueSOS = async (payload, token) =>
    (await dbPromise()).add('sosQueue', { payload, token, queuedAt: Date.now() });

export const getQueuedSOS = async () => (await dbPromise()).getAll('sosQueue');

export const removeQueuedSOS = async (id) => (await dbPromise()).delete('sosQueue', id);
