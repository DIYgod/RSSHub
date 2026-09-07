import { config } from '@/config';
import logger from '@/utils/logger';
import type { getPlaywrightPage } from '@/utils/playwright';

const maxFormBytes = 16 * 1024;
const bilibiliRetryPaths = new Set(['/x/web-interface/popular', '/x/polymer/web-dynamic/v1/feed/space', '/x/space/wbi/arc/search']);
const pixivRetryPaths = new Set(['/v1/illust/ranking', '/v1/user/illusts', '/v1/search/illust', '/v1/search/popular-preview/illust']);
const responseHeadersToRemove = new Set(['connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade', 'content-encoding', 'content-length']);

type PlaywrightPage = Awaited<ReturnType<typeof getPlaywrightPage>>;
type PausedRequest = {
    requestId: string;
    request: { url: string };
    frameId: string;
    resourceType: string;
    redirectedRequestId?: string;
};

const abortError = () => new DOMException('The request was aborted', 'AbortError');

async function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
    const aborted = Promise.withResolvers<never>();
    const onAbort = () => aborted.reject(abortError());
    signal.addEventListener('abort', onAbort, { once: true });
    if (signal.aborted) {
        onAbort();
    }
    try {
        return await Promise.race([promise, aborted.promise]);
    } finally {
        signal.removeEventListener('abort', onAbort);
    }
}

async function discardBody(body: { cancel(): Promise<unknown> }) {
    try {
        await body.cancel();
    } catch {
        // Cancellation can race with a stream that already failed or was closed.
    }
}

function retryStatus(request: Request): number | undefined {
    const url = new URL(request.url);
    if (request.method === 'GET') {
        if (
            url.origin === 'https://api.bilibili.com' &&
            bilibiliRetryPaths.has(url.pathname) &&
            // The legacy video-all route fetches later pages concurrently.
            (url.pathname !== '/x/space/wbi/arc/search' || url.searchParams.get('pn') === '1')
        ) {
            return 412;
        }
        if (url.origin === 'https://app-api.pixiv.net' && pixivRetryPaths.has(url.pathname)) {
            return 403;
        }
    } else if (
        request.method === 'POST' &&
        url.origin === 'https://oauth.secure.pixiv.net' &&
        url.pathname === '/auth/token' &&
        request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() === 'application/x-www-form-urlencoded' &&
        Number(request.headers.get('content-length') || 0) <= maxFormBytes
    ) {
        return 403;
    }
}

async function readSmallForm(request: Request, signal: AbortSignal): Promise<Uint8Array | undefined> {
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
        reader = request.body?.getReader();
        if (!reader) {
            return;
        }
        while (true) {
            // Read serially so the size limit also bounds buffered form data.
            // eslint-disable-next-line no-await-in-loop
            const { done, value } = await abortable(reader.read(), signal);
            if (done) {
                break;
            }
            length += value.byteLength;
            if (length > maxFormBytes) {
                return;
            }
            chunks.push(value);
        }
        const body = new Uint8Array(length);
        let offset = 0;
        for (const chunk of chunks) {
            body.set(chunk, offset);
            offset += chunk.byteLength;
        }
        return body;
    } catch {
        return;
    } finally {
        if (reader) {
            // A tee branch's cancel promise can wait for the native fetch branch.
            void discardBody(reader);
            try {
                reader.releaseLock();
            } catch {
                // An aborted pending read may still own the stream lock.
            }
        }
    }
}

async function destroyPage(instance: PlaywrightPage) {
    const controller = new AbortController();
    // The helper first bounds context.close at 5s, then disconnects the WebSocket.
    const timer = setTimeout(() => controller.abort(), 7000);
    try {
        await abortable(instance.destroy(), controller.signal);
    } catch {
        logger.warn('Playwright request replay cleanup failed.');
    } finally {
        clearTimeout(timer);
    }
}

async function replayRequest(request: Request, signal: AbortSignal, body?: Uint8Array): Promise<Response> {
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    signal.addEventListener('abort', onAbort, { once: true });
    const timeout = Math.max(1, Math.min(config.requestTimeout || 30000, 30000));
    const timer = setTimeout(onAbort, timeout);
    const wait = <T>(promise: Promise<T>) => abortable(promise, controller.signal);
    let instance: PlaywrightPage | undefined;
    let closing = false;
    try {
        if (signal.aborted) {
            throw abortError();
        }
        const { getPlaywrightPage } = await wait(import('@/utils/playwright'));
        const opening = getPlaywrightPage(request.url, { useConfiguredEndpoint: true, javaScriptEnabled: false, noGoto: true, closeTimeout: 0 });
        const cleanLateOpening = async () => {
            try {
                const lateInstance = await opening;
                if (closing) {
                    await destroyPage(lateInstance);
                } else {
                    instance = lateInstance;
                }
            } catch {
                // The awaited setup reports its failure; only late success needs cleanup.
            }
        };
        void cleanLateOpening();
        instance = await wait(opening);
        const { context, page } = instance;
        const session = await wait(context.newCDPSession(page));
        const { frameTree } = await wait(session.send('Page.getFrameTree'));
        let replayed = false;
        session.on('Fetch.requestPaused', (event: PausedRequest) => {
            const handleRequest = async () => {
                // CDP pauses every redirect hop; page.route only handles the first.
                if (closing || controller.signal.aborted || replayed || event.redirectedRequestId || event.resourceType !== 'Document' || event.frameId !== frameTree.frame.id || event.request.url !== request.url) {
                    await session.send('Fetch.failRequest', { requestId: event.requestId, errorReason: 'BlockedByClient' });
                    return;
                }
                replayed = true;
                await session.send('Fetch.continueRequest', {
                    requestId: event.requestId,
                    method: request.method,
                    headers: Array.from(request.headers, ([name, value]) => ({ name, value })),
                    ...(body && { postData: Buffer.from(body).toString('base64') }),
                });
            };
            void handleRequest().catch(() => controller.abort());
        });
        await wait(session.send('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }], handleAuthRequests: false }));
        const response = await wait(page.goto(request.url, { waitUntil: 'domcontentloaded', timeout }));
        if (!response || response.url() !== request.url || !replayed) {
            throw new Error('Playwright request replay did not return the expected response');
        }
        const bytes = await wait(response.body());
        const rawHeaders = await wait(response.headersArray());
        const excludedHeaders = new Set(responseHeadersToRemove);
        for (const { name, value } of rawHeaders) {
            if (name.toLowerCase() === 'connection') {
                for (const header of value.split(',')) {
                    excludedHeaders.add(header.trim().toLowerCase());
                }
            }
        }
        const headers = new Headers();
        for (const { name, value } of rawHeaders) {
            if (!excludedHeaders.has(name.toLowerCase())) {
                headers.append(name, value);
            }
        }
        const status = response.status();
        return new Response([204, 205, 304].includes(status) ? null : Uint8Array.from(bytes), { status, statusText: response.statusText(), headers });
    } finally {
        closing = true;
        clearTimeout(timer);
        signal.removeEventListener('abort', onAbort);
        if (instance) {
            await destroyPage(instance);
        }
    }
}

export default async function fetchWithPlaywrightRetry(request: Request, nativeFetch: (request: Request) => Promise<Response>): Promise<Response> {
    const status = config.playwrightWSEndpoint ? retryStatus(request) : undefined;
    if (status === undefined) {
        return nativeFetch(request);
    }
    // Capture only these small OAuth forms before native fetch consumes the body.
    const replay = request.clone();
    const bodyController = new AbortController();
    const bodyTimer = setTimeout(() => bodyController.abort(), 5000);
    const stopBody = () => bodyController.abort();
    request.signal.addEventListener('abort', stopBody, { once: true });
    const bodyPromise = request.method === 'POST' ? readSmallForm(replay, bodyController.signal) : Promise.resolve(undefined);
    try {
        // These API endpoints must not forward credentials or form bodies to a redirect.
        const response = await nativeFetch(new Request(request, { redirect: 'manual' }));
        if (request.signal.aborted) {
            throw abortError();
        }
        if (response.status !== status || response.redirected) {
            return response;
        }
        const body = await bodyPromise;
        if (request.method === 'POST' && !body) {
            return response;
        }
        try {
            // Keep the original signal: a cloned Request can lose abort propagation after GC.
            const replayedResponse = await replayRequest(replay, request.signal, body);
            if (request.signal.aborted) {
                throw abortError();
            }
            if (response.body) {
                void discardBody(response.body);
            }
            return replayedResponse;
        } catch {
            if (request.signal.aborted) {
                throw abortError();
            }
            logger.warn('Playwright request replay failed; returning the original upstream response.');
            return response;
        }
    } finally {
        clearTimeout(bodyTimer);
        stopBody();
        request.signal.removeEventListener('abort', stopBody);
    }
}
