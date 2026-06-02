import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './mocks/server';

// Disable cache for SPEC route tests. The cache module initializes once at
// first import (via @/config) and the `cache` singleton is then used for the
// lifetime of the process. Setting this env var at module top-level here
// (which runs before any test's `await import('@/routes/spec/...')`) forces
// the no-op cache path so each test re-fetches the upstream API instead of
// returning a cached prior response. AGENTS.md rule #44: never fabricate
// missing items — we want every test to read the live MSW response.
process.env.CACHE_TYPE = 'NO';

/**
 * MSW lifecycle for SPEC route tests. Importing this file at the top of a
 * test file is enough — vitest's `beforeAll` / `afterEach` / `afterAll` are
 * registered as module-level side effects.
 *
 * We intentionally do NOT register this in `vitest.config.ts`'s `setupFiles`,
 * because the repo's existing `lib/setup.test.ts` already starts a separate
 * MSW server for the upstream route tests. Keeping SPEC test MSW lifecycle
 * scoped to the files that opt in avoids handler collisions on the same URLs.
 */

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});
