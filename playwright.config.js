import { defineConfig, devices } from '@playwright/test';

const API_PORT = 5055;
const WEB_PORT = 4174;

export default defineConfig({
    testDir: './e2e',
    timeout: 60_000,
    expect: {
        timeout: 15_000,
        toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
    },
    fullyParallel: false,
    workers: 1, // tests share one seeded backend
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
    use: {
        baseURL: `http://localhost:${WEB_PORT}`,
        trace: 'retain-on-failure',
        ...devices['Desktop Chrome'],
    },
    webServer: [
        {
            command: 'node e2e/test-backend.cjs',
            url: `http://localhost:${API_PORT}/`,
            env: { E2E_API_PORT: String(API_PORT) },
            timeout: 180_000,
            reuseExistingServer: !process.env.CI,
        },
        {
            command: `npx vite build && npx vite preview --port ${WEB_PORT} --strictPort`,
            url: `http://localhost:${WEB_PORT}`,
            env: {
                VITE_API_BASE: `http://localhost:${API_PORT}/api`,
                VITE_SOCKET_URL: `http://localhost:${API_PORT}`,
            },
            timeout: 180_000,
            reuseExistingServer: !process.env.CI,
        },
    ],
});
