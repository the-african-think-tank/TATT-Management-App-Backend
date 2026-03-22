/**
 * Hook: useHibpCheck
 *
 * Checks a password against the HaveIBeenPwned (HIBP) Pwned Passwords API
 * using the k-anonymity model. This means:
 *   1. We SHA-1 hash the password entirely client-side.
 *   2. Only the first 5 characters of the hex hash are sent to HIBP.
 *   3. HIBP returns ALL hash suffixes that start with those 5 chars.
 *   4. We compare locally — the full password or hash NEVER leaves the browser.
 *
 * This approach is safe, private, and endorsed by NIST SP 800-63B.
 *
 * @see https://haveibeenpwned.com/API/v3#PwnedPasswords
 */

import { useState, useCallback, useRef } from "react";

export type HibpStatus =
  | "idle"
  | "checking"
  | "pwned"   // password was found in breach database
  | "safe"    // password was NOT found
  | "error";  // network error during check

export interface HibpResult {
  status: HibpStatus;
  count: number;       // Number of times seen in breaches (0 if safe/error/idle)
  check: (password: string) => Promise<void>;
  reset: () => void;
}

async function sha1Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function useHibpCheck(): HibpResult {
  const [status, setStatus] = useState<HibpStatus>("idle");
  const [count, setCount] = useState(0);
  // Debounce ref — we only fire if the password hasn't changed for 800ms
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastChecked = useRef<string>("");

  const check = useCallback(async (password: string) => {
    // Clear any pending debounced call
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // Reset if empty
    if (!password) {
      setStatus("idle");
      setCount(0);
      return;
    }

    // Debounce — wait 800ms after the user stops typing before hitting the API
    debounceTimer.current = setTimeout(async () => {
      // Don't re-check the exact same password
      if (password === lastChecked.current) return;
      lastChecked.current = password;

      setStatus("checking");
      setCount(0);

      try {
        const hash = await sha1Hex(password);
        const prefix = hash.slice(0, 5);    // First 5 chars sent to API
        const suffix = hash.slice(5);       // Remainder checked locally

        const response = await fetch(
          `https://api.pwnedpasswords.com/range/${prefix}`,
          {
            headers: {
              // Padding header adds noise to responses, increasing anonymity
              "Add-Padding": "true",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HIBP API responded with ${response.status}`);
        }

        const text = await response.text();

        // Each line is: "SUFFIX:COUNT"
        const lines = text.split("\n");
        let pwnCount = 0;

        for (const line of lines) {
          const [lineSuffix, lineCount] = line.trim().split(":");
          if (lineSuffix === suffix) {
            pwnCount = parseInt(lineCount || "0", 10);
            break;
          }
        }

        if (pwnCount > 0) {
          setStatus("pwned");
          setCount(pwnCount);
        } else {
          setStatus("safe");
          setCount(0);
        }
      } catch (err) {
        console.warn("[HIBP] Check failed:", err);
        // On network error, fail silently — don't block sign-up
        setStatus("error");
        setCount(0);
      }
    }, 800);
  }, []);

  const reset = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    lastChecked.current = "";
    setStatus("idle");
    setCount(0);
  }, []);

  return { status, count, check, reset };
}
