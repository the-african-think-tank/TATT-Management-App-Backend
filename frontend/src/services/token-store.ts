/**
 * In-memory token store.
 *
 * Rationale: Storing JWTs in localStorage exposes them to XSS attacks, since any
 * JavaScript running on the page can read localStorage. By keeping the access token
 * in a JavaScript module-level variable, it is never accessible to injected scripts
 * that don't control this module (e.g., via third-party CDN scripts).
 *
 * The trade-off is that the token does not persist across page refreshes. To solve
 * this, a short-lived, non-sensitive "session hint" is stored in localStorage/sessionStorage
 * purely to trigger a silent re-auth on load (the real /auth/me call validates it).
 *
 * For full security, the ideal solution is HttpOnly cookies set by the server.
 * This is the safest client-side option available without backend changes.
 */

let accessToken: string | null = null;

export const tokenStore = {
    get: (): string | null => accessToken,
    set: (token: string): void => {
        accessToken = token;
        // Store a non-sensitive hint so we know to attempt re-auth on refresh.
        // This is NOT the token itself - just a flag.
        try { sessionStorage.setItem('auth_hint', '1'); } catch { /* SSR safe */ }
    },
    clear: (): void => {
        accessToken = null;
        try { sessionStorage.removeItem('auth_hint'); } catch { /* SSR safe */ }
    },
    hasHint: (): boolean => {
        try { return sessionStorage.getItem('auth_hint') === '1'; } catch { return false; }
    },
};
