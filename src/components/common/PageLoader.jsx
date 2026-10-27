/**
 * PageLoader — Suspense fallback while a lazy route chunk downloads.
 * min-h-screen reserves the page's space so the footer doesn't jump (CLS).
 */
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading page…</span>
    </div>
);

export default PageLoader;
