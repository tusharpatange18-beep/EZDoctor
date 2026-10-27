import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
    { name: 'home', path: '/', ready: 'Emergency Medical Help' },
    { name: 'login', path: '/login', ready: 'Welcome Back' },
    { name: 'register', path: '/register', ready: 'Create Account' },
    { name: 'doctors', path: '/doctors', ready: 'Dr. Rahul Sharma' },
];

for (const { name, path, ready } of PAGES) {
    test(`${name} page has no WCAG A/AA violations (axe)`, async ({ page }) => {
        await page.goto(path);
        await expect(page.getByText(ready).first()).toBeVisible();
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        expect(results.violations.map(v => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
    });
}

test('SOS form can be completed with the keyboard only', async ({ browser }) => {
    const ctx = await browser.newContext({ geolocation: { latitude: 19.07, longitude: 72.87 }, permissions: ['geolocation'] });
    const page = await ctx.newPage();
    const email = `kbd-${Date.now()}@e2e.test`;
    await page.request.post('http://localhost:5055/api/auth/register', {
        data: { name: 'Keyboard User', email, password: 'secret123', role: 'patient' },
    });

    // On a fresh page load the skip link is the first tab stop
    await page.goto('/login');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();

    await page.getByLabel('Email').focus();
    await page.keyboard.type(email);
    await page.keyboard.press('Tab');
    await page.keyboard.type('secret123');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/home$/);

    // After client-side navigation focus moves to the new page's content
    await expect(page.locator('#main-content')).toBeFocused();

    await page.getByRole('button', { name: 'Send emergency SOS' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/sos$/);
    await expect(page.locator('#main-content')).toBeFocused();

    // Tab order follows the form: name -> phone -> type -> symptoms -> submit
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Patient Name')).toBeFocused();
    await page.keyboard.press('Tab'); // -> phone
    await expect(page.getByLabel('Phone Number')).toBeFocused();
    await page.keyboard.type('9876543210');
    await page.keyboard.press('Tab'); // -> type
    await page.keyboard.press('Tab'); // -> symptoms
    await page.keyboard.type('Keyboard only test');
    await page.keyboard.press('Tab'); // -> submit
    await expect(page.getByRole('button', { name: /send sos request/i })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/track$/);
    await ctx.close();
});

// Visual regression: pixel snapshots are OS-specific (font rendering), so these
// run where the baselines were made. Update with: npm run test:visual -- --update-snapshots
test.describe('visual regression @visual', () => {
    for (const { name, path, ready } of PAGES) {
        test(`${name} looks unchanged`, async ({ page }) => {
            await page.setViewportSize({ width: 1280, height: 800 });
            await page.goto(path);
            await expect(page.getByText(ready).first()).toBeVisible();
            await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
        });
    }
});
