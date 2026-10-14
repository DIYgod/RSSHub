import type { DurableObjectState } from '@cloudflare/workers-types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BrowserSession } from './browser-session.worker';

const mocks = vi.hoisted(() => ({ acquire: vi.fn() }));
vi.mock('@cloudflare/playwright', () => ({ acquire: mocks.acquire }));

let storage: Map<string, string>;
const binding = { fetch: vi.fn() };

function createObject() {
    const state = {
        blockConcurrencyWhile: (callback: () => Promise<void>) => callback(),
        storage: {
            get: vi.fn((key) => Promise.resolve(storage.get(key))),
            put: vi.fn((key, value) => {
                storage.set(key, value);
                return Promise.resolve();
            }),
            delete: vi.fn((key) => Promise.resolve(storage.delete(key))),
        },
    };
    return { object: new BrowserSession(state as unknown as DurableObjectState, { BROWSER: binding }), state };
}

function request(invalidSessionId?: string) {
    return new Request('https://browser-session/session', { method: 'POST', body: JSON.stringify(invalidSessionId ? { invalidSessionId } : {}) });
}

beforeEach(() => {
    vi.clearAllMocks();
    mocks.acquire.mockReset().mockResolvedValue({ sessionId: 'first-session' });
    storage = new Map();
});

describe('Browser Run session coordinator', () => {
    it('acquires once and reuses the session for subsequent requests', async () => {
        const { object } = createObject();
        expect(await (await object.fetch(request())).json()).toEqual({ sessionId: 'first-session' });
        expect(await (await object.fetch(request())).json()).toEqual({ sessionId: 'first-session' });
        expect(mocks.acquire).toHaveBeenCalledOnce();
        expect(mocks.acquire).toHaveBeenCalledWith(binding, { keep_alive: 60000 });
        expect(storage.get('sessionId')).toBe('first-session');
    });

    it('coalesces simultaneous acquisitions while the browser is starting', async () => {
        const acquisition = Promise.withResolvers<{ sessionId: string }>();
        mocks.acquire.mockReturnValueOnce(acquisition.promise);
        const { object } = createObject();
        const pending = Promise.all([object.fetch(request()), object.fetch(request()), object.fetch(request())]);
        await vi.waitFor(() => expect(mocks.acquire).toHaveBeenCalledOnce());
        acquisition.resolve({ sessionId: 'concurrent-session' });
        const responses = await pending;
        expect(await Promise.all(responses.map((response) => response.json()))).toEqual(Array.from({ length: 3 }, () => ({ sessionId: 'concurrent-session' })));
        expect(mocks.acquire).toHaveBeenCalledOnce();
    });

    it('restores the session ID after the Durable Object is evicted', async () => {
        await createObject().object.fetch(request());
        const restarted = createObject();
        expect(await (await restarted.object.fetch(request())).json()).toEqual({ sessionId: 'first-session' });
        expect(mocks.acquire).toHaveBeenCalledOnce();
    });

    it('coalesces concurrent invalidations of the same expired session', async () => {
        storage.set('sessionId', 'expired');
        mocks.acquire.mockResolvedValueOnce({ sessionId: 'replacement' });
        const { object, state } = createObject();
        const responses = await Promise.all([object.fetch(request('expired')), object.fetch(request('expired'))]);
        expect(await Promise.all(responses.map((response) => response.json()))).toEqual([{ sessionId: 'replacement' }, { sessionId: 'replacement' }]);
        expect(mocks.acquire).toHaveBeenCalledOnce();
        expect(state.storage.delete).toHaveBeenCalledOnce();
        expect(storage.get('sessionId')).toBe('replacement');
    });

    it('does not invalidate a newer session when an old request reports failure', async () => {
        storage.set('sessionId', 'current-session');
        const { object } = createObject();
        expect(await (await object.fetch(request('old-session'))).json()).toEqual({ sessionId: 'current-session' });
        expect(mocks.acquire).not.toHaveBeenCalled();
    });

    it('recovers from an acquisition failure without poisoning queued requests', async () => {
        mocks.acquire.mockRejectedValueOnce(new Error('Quota temporarily exhausted'));
        const { object } = createObject();
        const results = await Promise.allSettled([object.fetch(request()), object.fetch(request())]);
        expect(results[0].status).toBe('rejected');
        expect(results[1].status).toBe('fulfilled');
        expect(mocks.acquire).toHaveBeenCalledTimes(2);
        expect(storage.get('sessionId')).toBe('first-session');
    });

    it('rejects invalid methods and invalidation payloads before acquisition', async () => {
        const { object } = createObject();
        expect((await object.fetch(new Request('https://browser-session/session'))).status).toBe(405);
        const invalidRequest = new Request('https://browser-session/session', { method: 'POST', body: JSON.stringify({ invalidSessionId: 123 }) });
        expect((await object.fetch(invalidRequest)).status).toBe(400);
        expect(mocks.acquire).not.toHaveBeenCalled();
    });
});
