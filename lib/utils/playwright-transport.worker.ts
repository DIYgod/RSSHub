import { AsyncLocalStorage } from 'node:async_hooks';

export type TransportFetch = (url: string, options: RequestInit) => Promise<Response & { webSocket?: WorkerSocket }>;
type WorkerSocket = {
    accept(): void;
    send(data: string): void;
    close(code?: number, reason?: string): void;
    addEventListener(type: string, listener: (event: { data?: string | ArrayBuffer }) => void): void;
};
type Message = Record<string, unknown>;
type Progress = { race<T>(promise: Promise<T>): Promise<T> };
type ConnectOptions = { headers?: Record<string, string> };
export type TransportServer = { WebSocketTransport: { connect: (progress: Progress, endpoint: string, options?: ConnectOptions) => Promise<NativeTransport> } };
const requestFetch = new AsyncLocalStorage<TransportFetch>();
export const withTransportFetch = <T>(fetchImpl: TransportFetch, callback: () => T) => requestFetch.run(fetchImpl, callback);
// Keep the native Upgrade fetch separate from the feed request rewriter.
const nativeFetch: TransportFetch = fetch.bind(globalThis);

async function upgradeSocket(fetchImpl: TransportFetch, url: string, headers: Headers, signal: AbortSignal) {
    const response = await fetchImpl(url, { headers, redirect: 'manual', signal });
    // progress.race can reject before a concurrent successful upgrade is delivered.
    if (signal.aborted) {
        try {
            response.webSocket?.accept();
            response.webSocket?.close(1000, 'Connection setup cancelled');
        } catch {
            // The abandoned socket may already have closed during cancellation.
        }
        throw new Error('Remote Playwright WebSocket connection was cancelled');
    }
    return response;
}

async function cancelFailedResponse(response: Response) {
    try {
        await response.body?.cancel();
    } catch {
        // Preserve the failed upgrade status when its body is already unavailable.
    }
}

export function installNativeTransport(server: TransportServer, { handshakeTimeoutMs = 20000, fetchImpl = nativeFetch }: { handshakeTimeoutMs?: number; fetchImpl?: TransportFetch } = {}) {
    server.WebSocketTransport.connect = async (progress, endpoint, options = {}) => {
        const url = new URL(endpoint);
        if (!['ws:', 'wss:'].includes(url.protocol) || url.username || url.password) {
            throw new Error('Remote Playwright requires a WS(S) endpoint without URL userinfo');
        }
        if (new Headers(options.headers).get('x-playwright-proxy')) {
            throw new Error('Remote Playwright exposeNetwork is unavailable in this Worker transport');
        }
        url.protocol = url.protocol === 'wss:' ? 'https:' : 'http:';
        const headers = new Headers(options.headers);
        headers.set('Upgrade', 'websocket');
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), handshakeTimeoutMs);
        let socket: WorkerSocket | undefined;
        try {
            const pending = upgradeSocket(requestFetch.getStore() ?? fetchImpl, url.href, headers, controller.signal);
            const response = await (progress ? progress.race(pending) : pending);
            socket = response.webSocket;
            if (response.status !== 101 || !socket) {
                void cancelFailedResponse(response);
                throw new Error(`Remote Playwright WebSocket upgrade failed with HTTP ${response.status}`);
            }
            const transport = new NativeTransport(socket, response.headers);
            socket.accept();
            return transport;
        } catch (error) {
            controller.abort();
            try {
                socket?.close(1000, 'Connection setup failed');
            } catch {
                // Setup may fail after the peer has already closed the socket.
            }
            if (error instanceof Error && error.message.startsWith('Remote Playwright ')) {
                throw error;
            }
            // oxlint-disable-next-line eslint/preserve-caught-error -- Native errors may contain endpoint credentials; do not expose them through cause.
            throw new Error('Remote Playwright WebSocket connection failed or timed out');
        } finally {
            clearTimeout(timer);
        }
    };
}

export class NativeTransport {
    private pendingMessages: Message[] = [];
    private closed = false;
    private closing = false;
    private closeNotified = false;
    private closedPromise: Promise<void>;
    private resolveClosed!: () => void;
    private messageHandler?: (message: Message) => void;
    private closeHandler?: (reason?: string) => void;
    private closeTimer?: ReturnType<typeof setTimeout>;
    readonly headers: Array<{ name: string; value: string }>;

    constructor(
        private socket: WorkerSocket,
        headers: Headers
    ) {
        this.headers = Array.from(headers, ([name, value]) => ({ name, value }));
        this.closedPromise = new Promise((resolve) => {
            this.resolveClosed = resolve;
        });
        socket.addEventListener('message', (event) => {
            try {
                const text = typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data as ArrayBuffer);
                const message = JSON.parse(text);
                if (this.messageHandler) {
                    this.deliver(message);
                } else {
                    this.pendingMessages.push(message);
                }
            } catch {
                this.close();
            }
        });
        socket.addEventListener('close', () => this.finishClose());
        socket.addEventListener('error', () => this.close());
    }

    set onmessage(handler: ((message: Message) => void) | undefined) {
        this.messageHandler = handler;
        if (handler) {
            for (const message of this.pendingMessages.splice(0)) {
                this.deliver(message);
            }
        }
    }

    get onmessage() {
        return this.messageHandler;
    }

    set onclose(handler: ((reason?: string) => void) | undefined) {
        this.closeHandler = handler;
        this.notifyClose();
    }

    get onclose() {
        return this.closeHandler;
    }

    deliver(message: Message) {
        queueMicrotask(() => {
            if (this.closed) {
                return;
            }
            try {
                this.messageHandler?.(message);
            } catch {
                this.close();
            }
        });
    }

    notifyClose() {
        if (!this.closed || !this.closeHandler || this.closeNotified) {
            return;
        }
        this.closeNotified = true;
        queueMicrotask(() => this.closeHandler?.('Remote Playwright connection closed'));
    }

    finishClose() {
        clearTimeout(this.closeTimer);
        this.closed = true;
        this.pendingMessages = [];
        this.resolveClosed();
        this.notifyClose();
    }

    send(message: Message) {
        if (this.closed || this.closing) {
            throw new Error('Remote Playwright connection is closed');
        }
        this.socket.send(JSON.stringify(message));
    }

    close() {
        if (this.closed || this.closing) {
            return;
        }
        this.closing = true;
        try {
            this.socket.close(1000, 'Client closed');
        } catch {
            this.finishClose();
        }
        if (!this.closed) {
            this.closeTimer = setTimeout(() => this.finishClose(), 1000);
        }
    }

    async closeAndWait() {
        this.close();
        await this.closedPromise;
    }
}
