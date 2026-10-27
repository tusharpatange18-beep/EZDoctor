import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
    cleanup();
    sessionStorage.clear();
    globalThis.indexedDB = new IDBFactory(); // fresh IndexedDB for every test
    vi.restoreAllMocks();
});
