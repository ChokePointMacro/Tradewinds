import posthog from 'posthog-js';

let started = false;

/**
 * Initialize PostHog. No-ops if the key is absent (e.g. local mock dev) so the
 * app never blocks on analytics. Feature flags gate risky modules per Section 21.
 */
export function initAnalytics(): void {
  if (started) return;
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    capture_pageview: true,
    person_profiles: 'identified_only',
  });
  started = true;
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (!started) return;
  posthog.capture(event, props);
}

/**
 * Returns whether a PostHog feature flag is enabled, treating an absent
 * analytics setup (no key / not started) as `defaultWhenUnavailable`. Flags act
 * as kill-switches for risky modules (PRD §21); local dev without PostHog should
 * still exercise the gated path, so the default is permissive.
 */
export function isFeatureEnabled(flag: string, defaultWhenUnavailable = true): boolean {
  if (!started) return defaultWhenUnavailable;
  return posthog.isFeatureEnabled(flag) !== false;
}
