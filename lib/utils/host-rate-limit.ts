export type HostRateLimits = Record<string, { points: number; duration: number }>;

export function parseHostRateLimits(value?: string): HostRateLimits {
    if (!value) {
        return {};
    }
    const limits = JSON.parse(value);
    if (!limits || typeof limits !== 'object' || Array.isArray(limits)) {
        throw new Error('REQUEST_RATE_LIMITS must be a JSON object keyed by hostname.');
    }
    const normalized: HostRateLimits = Object.create(null);
    for (const [hostname, policy] of Object.entries(limits)) {
        const host = hostname.toLowerCase();
        if (!/^[\w.-]+$/.test(host) || new URL(`https://${host}`).hostname !== host || !policy || typeof policy !== 'object') {
            throw new Error(`Invalid hostname or policy in REQUEST_RATE_LIMITS: ${hostname}`);
        }
        const { points, duration } = policy as HostRateLimits[string];
        if (!Number.isSafeInteger(points) || points <= 0 || !Number.isFinite(duration) || duration <= 0) {
            throw new Error(`REQUEST_RATE_LIMITS for ${hostname} requires positive integer points and positive duration in seconds.`);
        }
        normalized[host] = { points, duration };
    }
    return normalized;
}

interface QueuedRequest {
    resolve: () => void;
    signal?: AbortSignal;
    onAbort: () => void;
}

interface HostState {
    interval: number;
    lastStart: number;
    queue: QueuedRequest[];
    timer?: ReturnType<typeof setTimeout>;
}

function scheduleNext(state: HostState) {
    clearTimeout(state.timer);
    state.timer = undefined;
    if (!state.queue.length) {
        return;
    }
    const delay = state.lastStart + state.interval - performance.now();
    if (delay > 0) {
        // Node timers overflow above this value; long policies must keep waiting.
        state.timer = setTimeout(() => scheduleNext(state), Math.min(delay, 2_147_483_647));
        return;
    }
    const request = state.queue.shift()!;
    request.signal?.removeEventListener('abort', request.onAbort);
    // Only requests actually released to fetch consume a rate-limit interval.
    state.lastStart = performance.now();
    request.resolve();
    scheduleNext(state);
}

export function createHostRateLimiter(maxQueueSize = 4800) {
    const hosts = new Map<string, HostState>();
    return async (url: string, limits: HostRateLimits, signal?: AbortSignal) => {
        const hostname = new URL(url).hostname;
        if (!Object.hasOwn(limits, hostname)) {
            return;
        }
        const policy = limits[hostname];
        signal?.throwIfAborted();
        const interval = (policy.duration * 1000) / policy.points;
        let state = hosts.get(hostname);
        if (!state) {
            state = { interval, lastStart: -Infinity, queue: [] };
            hosts.set(hostname, state);
        }
        state.interval = interval;
        if (state.queue.length >= maxQueueSize) {
            throw new Error(`Outgoing request queue is full for ${hostname}. Reduce concurrency or adjust REQUEST_RATE_LIMITS.`);
        }
        const hostState = state;
        await new Promise<void>((resolve, reject) => {
            const request: QueuedRequest = {
                resolve,
                signal,
                onAbort: () => {
                    const index = hostState.queue.indexOf(request);
                    if (index === -1) {
                        return;
                    }
                    hostState.queue.splice(index, 1);
                    signal?.removeEventListener('abort', request.onAbort);
                    reject(signal?.reason);
                    scheduleNext(hostState);
                },
            };
            hostState.queue.push(request);
            signal?.addEventListener('abort', request.onAbort, { once: true });
            if (signal?.aborted) {
                request.onAbort();
            }
            scheduleNext(hostState);
        });
    };
}

export const waitForHostRateLimit = createHostRateLimiter();
