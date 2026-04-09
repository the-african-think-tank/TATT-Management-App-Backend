/**
 * In-memory token store with safe localStorage persistence.
 *
 * Rationale: Storing JWTs in localStorage allows sessions to survive page refreshes,
 * which is critical for user experience. However, some browsers (Brave, Safari, Firefox)
 * can throw SecurityErrors when accessing localStorage in private mode or with strict settings.
 */

const TOKEN_KEY = 'tatt_access_token';
const HINT_KEY = 'tatt_auth_hint';

// Helper to safely access localStorage
const safeStorage = {
    getItem: (key: string): string | null => {
        try {
            if (typeof window === 'undefined' || !window.localStorage) return null;
            return localStorage.getItem(key);
        } catch (e) {
            console.error('[Storage] Error reading from localStorage:', e);
            return null;
        }
    },
    setItem: (key: string, value: string): void => {
        try {
            if (typeof window === 'undefined' || !window.localStorage) return;
            localStorage.setItem(key, value);
        } catch (e) {
            console.error('[Storage] Error writing to localStorage:', e);
        }
    },
    removeItem: (key: string): void => {
        try {
            if (typeof window === 'undefined' || !window.localStorage) return;
            localStorage.removeItem(key);
        } catch (e) {
            console.error('[Storage] Error removing from localStorage:', e);
        }
    }
};

export const tokenStore = {
    get: (): string | null => {
        return safeStorage.getItem(TOKEN_KEY);
    },
    set: (token: string): void => {
        safeStorage.setItem(TOKEN_KEY, token);
        // Store a non-sensitive hint so we know to attempt re-auth on load.
        safeStorage.setItem(HINT_KEY, '1');
    },
    clear: (): void => {
        safeStorage.removeItem(TOKEN_KEY);
        safeStorage.removeItem(HINT_KEY);
    },
    hasHint: (): boolean => {
        return safeStorage.getItem(HINT_KEY) === '1';
    },
};
