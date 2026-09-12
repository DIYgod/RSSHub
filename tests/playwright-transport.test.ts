// oxlint-disable unicorn/prefer-add-event-listener -- Playwright transports expose protocol callbacks, not EventTarget methods.
import { afterEach, describe, expect, it, vi } from 'vitest';

import { installNativeTransport, type TransportFetch, type TransportServer, withTransportFetch } from '../lib/utils/playwright-transport.worker';

type SocketEvent = { data?: string | ArrayBuffer };

class FakeSocket {
    listeners = new Map<string, Array<(event: SocketEvent) => void>>();
    accept = vi.fn();
    send = vi.fn();
    close = vi.fn();

    addEventListener(type: string, listener: (event: SocketEvent) => void) {
        const listeners = this.listeners.get(type) ?? [];
        listeners.push(listener);
        this.listeners.set(type, listeners);
    }

    emit(type: string, event: SocketEvent = {}) {
        const listeners = this.listeners.get(type) ?? [];
        for (const listener of listeners) {
            listener(event);
        }
    }
}

const progress = { race: <T>(promise: Promise<T>) => promise };
const responseFor = (socket: FakeSocket) => ({ status: 101, headers: new Headers({ 'x-playwright-test': 'ready' }), webSocket: socket }) as Awaited<ReturnType<TransportFetch>>;

function createServer(fetchImpl: TransportFetch, handshakeTimeoutMs = 20000) {
    const server: TransportServer = { WebSocketTransport: { connect: vi.fn() } };
    installNativeTransport(server, { fetchImpl, handshakeTimeoutMs });
    return server;
}

afterEach(() => {
    vi.useRealTimers();
});

describe('Worker Playwright WebSocket transport', () => {
    it('preserves the configured endpoint and protocol headers in a manual-redirect upgrade', async () => {
        const socket = new FakeSocket();
        const fetchImpl = vi.fn<TransportFetch>().mockResolvedValue(responseFor(socket));
        const server = createServer(fetchImpl);
        const transport = await server.WebSocketTransport.connect(progress, 'wss://browser.example/playwright?token=test-token', {
            headers: { 'User-Agent': 'Playwright/1.62.2', 'x-playwright-browser': 'chromium', Authorization: 'test-authorization' },
        });
        const [url, options] = fetchImpl.mock.calls[0];
        expect(url).toBe('https://browser.example/playwright?token=test-token');
        expect(options.redirect).toBe('manual');
        expect(new Headers(options.headers).get('upgrade')).toBe('websocket');
        expect(new Headers(options.headers).get('user-agent')).toBe('Playwright/1.62.2');
        expect(new Headers(options.headers).get('x-playwright-browser')).toBe('chromium');
        expect(new Headers(options.headers).get('authorization')).toBe('test-authorization');
        expect(socket.accept).toHaveBeenCalledOnce();
        expect(transport.headers).toContainEqual({ name: 'x-playwright-test', value: 'ready' });
        transport.send({ id: 1, method: 'initialize' });
        expect(socket.send).toHaveBeenCalledWith('{"id":1,"method":"initialize"}');
        socket.emit('close');
    });

    it.each([302, 428])('rejects HTTP %i without forwarding or exposing the response body', async (status) => {
        const cancel = vi.fn().mockResolvedValue(undefined);
        const fetchImpl = vi.fn<TransportFetch>().mockResolvedValue({ status, headers: new Headers(), body: { cancel } } as unknown as Awaited<ReturnType<TransportFetch>>);
        const server = createServer(fetchImpl);
        await expect(server.WebSocketTransport.connect(progress, 'wss://browser.example/playwright?token=test-token')).rejects.toThrow(`Remote Playwright WebSocket upgrade failed with HTTP ${status}`);
        expect(fetchImpl).toHaveBeenCalledOnce();
        expect(cancel).toHaveBeenCalledOnce();
    });

    it('rejects unsupported endpoint credentials and network exposure before fetching', async () => {
        const fetchImpl = vi.fn<TransportFetch>();
        const server = createServer(fetchImpl);
        await expect(server.WebSocketTransport.connect(progress, 'https://browser.example/playwright')).rejects.toThrow('requires a WS(S) endpoint');
        await expect(server.WebSocketTransport.connect(progress, 'wss://user:password@browser.example/playwright')).rejects.toThrow('without URL userinfo');
        await expect(server.WebSocketTransport.connect(progress, 'wss://browser.example/playwright', { headers: { 'X-Playwright-Proxy': '*' } })).rejects.toThrow('exposeNetwork is unavailable');
        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it('buffers protocol messages received before the client installs its handler', async () => {
        const socket = new FakeSocket();
        socket.accept.mockImplementation(() => socket.emit('message', { data: '{"id":1,"result":{}}' }));
        const server = createServer(vi.fn<TransportFetch>().mockResolvedValue(responseFor(socket)));
        const transport = await server.WebSocketTransport.connect(progress, 'wss://browser.example/playwright');
        socket.emit('message', { data: new TextEncoder().encode('{"id":2,"result":{}}').buffer });
        const onMessage = vi.fn();
        transport.onmessage = onMessage;
        await Promise.resolve();
        expect(onMessage.mock.calls.map(([message]) => message.id)).toEqual([1, 2]);
        socket.emit('close');
    });

    it('aborts a timed-out handshake and sanitizes transport errors', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        const fetchImpl = vi.fn<TransportFetch>(
            (_url, options) =>
                new Promise((_resolve, reject) => {
                    options.signal?.addEventListener('abort', () => reject(new Error('private endpoint and credential details')), { once: true });
                })
        );
        const server = createServer(fetchImpl, 100);
        const assertion = expect(server.WebSocketTransport.connect(progress, 'wss://browser.example/playwright')).rejects.toThrow('Remote Playwright WebSocket connection failed or timed out');
        await vi.advanceTimersByTimeAsync(100);
        await assertion;
        expect(fetchImpl.mock.calls[0][1].signal?.aborted).toBe(true);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('closes an upgrade delivered after Playwright cancels the connection', async () => {
        const pending = Promise.withResolvers<Awaited<ReturnType<TransportFetch>>>();
        const fetchImpl = vi.fn<TransportFetch>().mockReturnValue(pending.promise);
        const server = createServer(fetchImpl);
        const cancelledProgress = { race: <T>(promise: Promise<T>): Promise<T> => Promise.race([promise, Promise.reject(new Error('Connect cancelled'))]) };
        await expect(server.WebSocketTransport.connect(cancelledProgress, 'wss://browser.example/playwright')).rejects.toThrow('failed or timed out');
        expect(fetchImpl.mock.calls[0][1].signal?.aborted).toBe(true);
        const socket = new FakeSocket();
        pending.resolve(responseFor(socket));
        await Promise.resolve();
        await Promise.resolve();
        expect(socket.accept).toHaveBeenCalledOnce();
        expect(socket.close).toHaveBeenCalledWith(1000, 'Connection setup cancelled');
    });

    it('closes exactly once and waits for the peer close event', async () => {
        const socket = new FakeSocket();
        const server = createServer(vi.fn<TransportFetch>().mockResolvedValue(responseFor(socket)));
        const transport = await server.WebSocketTransport.connect(progress, 'wss://browser.example/playwright');
        const onClose = vi.fn();
        transport.onclose = onClose;
        const closed = vi.fn();
        const closing = (async () => {
            await transport.closeAndWait();
            closed();
        })();
        transport.close();
        await Promise.resolve();
        expect(closed).not.toHaveBeenCalled();
        expect(socket.close).toHaveBeenCalledOnce();
        expect(() => transport.send({ id: 1 })).toThrow('connection is closed');
        socket.emit('close');
        await closing;
        socket.emit('close');
        await Promise.resolve();
        expect(closed).toHaveBeenCalledOnce();
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('bounds close when the peer is silent and closes malformed protocol messages', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        const socket = new FakeSocket();
        const server = createServer(vi.fn<TransportFetch>().mockResolvedValue(responseFor(socket)));
        const transport = await server.WebSocketTransport.connect(progress, 'wss://browser.example/playwright');
        socket.emit('message', { data: 'invalid JSON' });
        expect(socket.close).toHaveBeenCalledOnce();
        const closing = transport.closeAndWait();
        await vi.advanceTimersByTimeAsync(1000);
        await closing;
        const lateOnClose = vi.fn();
        transport.onclose = lateOnClose;
        await Promise.resolve();
        expect(lateOnClose).toHaveBeenCalledOnce();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('keeps concurrent service-binding overrides isolated and restores native fetch', async () => {
        const sockets = [new FakeSocket(), new FakeSocket(), new FakeSocket()];
        const native = vi.fn<TransportFetch>().mockResolvedValue(responseFor(sockets[0]));
        const first = vi.fn<TransportFetch>().mockResolvedValue(responseFor(sockets[1]));
        const second = vi.fn<TransportFetch>().mockResolvedValue(responseFor(sockets[2]));
        const server = createServer(native);
        await Promise.all([
            withTransportFetch(first, async () => {
                await Promise.resolve();
                await server.WebSocketTransport.connect(progress, 'wss://first.example/playwright');
            }),
            withTransportFetch(second, async () => {
                await Promise.resolve();
                await server.WebSocketTransport.connect(progress, 'wss://second.example/playwright');
            }),
        ]);
        expect(first.mock.calls[0][0]).toBe('https://first.example/playwright');
        expect(second.mock.calls[0][0]).toBe('https://second.example/playwright');
        expect(native).not.toHaveBeenCalled();
        await server.WebSocketTransport.connect(progress, 'wss://native.example/playwright');
        expect(native).toHaveBeenCalledOnce();
        for (const socket of sockets) {
            socket.emit('close');
        }
    });
});
