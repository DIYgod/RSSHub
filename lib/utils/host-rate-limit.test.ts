import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { HostRateLimits } from './host-rate-limit';
import { createHostRateLimiter, parseHostRateLimits } from './host-rate-limit';

async function recordRequest(limiter: ReturnType<typeof createHostRateLimiter>, limits: HostRateLimits, requests: number[], id: number) {
    await limiter('https://example.com/', limits);
    requests.push(id);
}

beforeEach(() => vi.useFakeTimers({ toFake: ['performance', 'setTimeout', 'clearTimeout'] }));
afterEach(() => vi.useRealTimers());

test('spaces concurrent requests while leaving other hosts independent', async () => {
    const limiter = createHostRateLimiter();
    const limits = parseHostRateLimits('{"EXAMPLE.COM":{"points":1,"duration":2}}');
    const requests: number[] = [];
    await limiter('https://example.com/a', limits);
    const second = recordRequest(limiter, limits, requests, 2);
    const third = recordRequest(limiter, limits, requests, 3);
    await limiter('https://other.example.com/', limits);
    await vi.advanceTimersByTimeAsync(1999);
    expect(requests).toEqual([]);
    await vi.advanceTimersByTimeAsync(1);
    expect(requests).toEqual([2]);
    await vi.advanceTimersByTimeAsync(2000);
    await Promise.all([second, third]);
    expect(requests).toEqual([2, 3]);
});

test('aborts queued requests and bounds the queue', async () => {
    const limiter = createHostRateLimiter(1);
    const limits = { 'example.com': { points: 1, duration: 2 } };
    await limiter('https://example.com/', limits);
    const controller = new AbortController();
    const queued = limiter('https://example.com/', limits, controller.signal);
    const aborted = expect(queued).rejects.toThrow('cancelled');
    await expect(limiter('https://example.com/', limits)).rejects.toThrow('queue is full');
    controller.abort(new Error('cancelled'));
    await aborted;
});

test('keeps unspecified hosts unrestricted and rejects invalid policies', async () => {
    await createHostRateLimiter()('https://example.com/', {});
    expect(parseHostRateLimits()).toEqual({});
    for (const value of ['[]', 'null', '{"example.com":{"points":0,"duration":1}}', '{"https://example.com":{"points":1,"duration":1}}']) {
        expect(() => parseHostRateLimits(value)).toThrow();
    }
});

test('removes an aborted queue head without delaying the next request', async () => {
    const limiter = createHostRateLimiter();
    const limits = { 'example.com': { points: 1, duration: 2 } };
    await limiter('https://example.com/', limits);
    const controller = new AbortController();
    const head = limiter('https://example.com/', limits, controller.signal);
    const rejection = expect(head).rejects.toThrow('cancelled');
    const requests: number[] = [];
    const next = recordRequest(limiter, limits, requests, 3);
    controller.abort(new Error('cancelled'));
    await rejection;
    await vi.advanceTimersByTimeAsync(2000);
    await next;
    expect(requests).toEqual([3]);
});

test('removes aborted middle entries while retaining FIFO spacing', async () => {
    const limiter = createHostRateLimiter();
    const limits = { 'example.com': { points: 1, duration: 2 } };
    await limiter('https://example.com/', limits);
    const requests: number[] = [];
    const second = recordRequest(limiter, limits, requests, 2);
    const controller = new AbortController();
    const middle = limiter('https://example.com/', limits, controller.signal);
    const rejection = expect(middle).rejects.toThrow('cancelled');
    const fourth = recordRequest(limiter, limits, requests, 4);
    controller.abort(new Error('cancelled'));
    await rejection;
    await vi.advanceTimersByTimeAsync(2000);
    await second;
    expect(requests).toEqual([2]);
    await vi.advanceTimersByTimeAsync(2000);
    await fourth;
    expect(requests).toEqual([2, 4]);
});

test('repeated cancellation does not accumulate future reservations', async () => {
    const limiter = createHostRateLimiter(1);
    const limits = { 'example.com': { points: 1, duration: 2 } };
    await limiter('https://example.com/', limits);
    await Promise.all(
        Array.from({ length: 10 }, async () => {
            const controller = new AbortController();
            const queued = limiter('https://example.com/', limits, controller.signal);
            const rejection = expect(queued).rejects.toThrow('cancelled');
            controller.abort(new Error('cancelled'));
            await rejection;
        })
    );
    const requests: number[] = [];
    const next = recordRequest(limiter, limits, requests, 11);
    await vi.advanceTimersByTimeAsync(2000);
    await next;
    expect(requests).toEqual([11]);
    expect(vi.getTimerCount()).toBe(0);
});

test('does not read inherited hostname policies', async () => {
    const limiter = createHostRateLimiter();
    await limiter('https://constructor/', {});
    await limiter('https://__proto__/', {});
    expect(vi.getTimerCount()).toBe(0);
    const limits = parseHostRateLimits('{"__proto__":{"points":1,"duration":2}}');
    expect(Object.hasOwn(limits, '__proto__')).toBe(true);
    expect(Object.getPrototypeOf(limits)).toBeNull();
    const requests: number[] = [];
    await limiter('https://__proto__/', limits);
    const next = (async () => {
        await limiter('https://__proto__/', limits);
        requests.push(1);
    })();
    await vi.advanceTimersByTimeAsync(2000);
    await next;
    expect(requests).toEqual([1]);
});
