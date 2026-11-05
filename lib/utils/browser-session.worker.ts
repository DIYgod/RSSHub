import type { BrowserWorker } from '@cloudflare/playwright';
import type { DurableObjectState } from '@cloudflare/workers-types';

async function settle(operation: Promise<unknown>) {
    try {
        await operation;
    } catch {
        // Each caller observes its own failure; later requests can retry acquisition.
    }
}

// Store only the session ID: the browser can outlive both a request and this object.
export class BrowserSession {
    private sessionId?: string;
    private ready: Promise<void>;
    private queue: Promise<void> = Promise.resolve();

    constructor(
        private state: DurableObjectState,
        private env: { BROWSER: BrowserWorker }
    ) {
        this.ready = state.blockConcurrencyWhile(async () => {
            this.sessionId = await state.storage.get<string>('sessionId');
        });
    }

    async fetch(request: Request) {
        if (request.method !== 'POST' || new URL(request.url).pathname !== '/session') {
            return new Response('Use POST /session.', { status: 405 });
        }
        const body = (await request.json()) as { invalidSessionId?: unknown };
        if (body.invalidSessionId !== undefined && typeof body.invalidSessionId !== 'string') {
            return new Response('invalidSessionId must be a string.', { status: 400 });
        }
        const invalidSessionId = body.invalidSessionId as string | undefined;
        // Serializing acquisition also coalesces simultaneous reports of an expired ID.
        const queued = this.queue;
        const operation = (async () => {
            await queued;
            await this.ready;
            if (invalidSessionId && this.sessionId === invalidSessionId) {
                this.sessionId = undefined;
                await this.state.storage.delete('sessionId');
            }
            if (!this.sessionId) {
                const { acquire } = await import('@cloudflare/playwright');
                const { sessionId } = await acquire(this.env.BROWSER, { keep_alive: 60000 });
                await this.state.storage.put('sessionId', sessionId);
                this.sessionId = sessionId;
            }
            return this.sessionId;
        })();
        this.queue = settle(operation);
        return Response.json({ sessionId: await operation });
    }
}
