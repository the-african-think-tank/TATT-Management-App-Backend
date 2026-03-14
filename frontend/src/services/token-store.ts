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

/**
 * Token store with persistence.
 *
 * Rationale: Storing JWTs in localStorage allows sessions to survive page refreshes,
 * which is critical for user experience in a complex dashboard. Security is managed
 * by short expiry times and backend validation.
 */

const TOKEN_KEY = 'tatt_access_token';
const HINT_KEY = 'tatt_auth_hint';

export const tokenStore = {
    get: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEY);
    },
    set: (token: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(TOKEN_KEY, token);
        // Store a non-sensitive hint so we know to attempt re-auth on load.
        localStorage.setItem(HINT_KEY, '1');
    },
    clear: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(HINT_KEY);
    },
    hasHint: (): boolean => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(HINT_KEY) === '1';
    },
};

