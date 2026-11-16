import { createHmac } from 'node:crypto';

import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { encodeXML } from 'entities';
import type { Context } from 'hono';
import { z } from 'zod';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';

const endpoint = new URL('https://mcp.parallel.ai/mcp');
const userAgent = 'RSSHub (https://github.com/DIYgod/RSSHub)';
const refreshSeconds = 6 * 60 * 60;
const searchItemSchema = z.object({
    url: z.url({ protocol: /^https?$/ }),
    title: z.string().nullish(),
    publish_date: z.iso.date().nullish(),
    excerpts: z.array(z.string()),
});
const resultSchema = z.object({ results: z.array(searchItemSchema) });

let pending: { scope: string; result: Promise<DataItem[]> } | undefined;
let retryAfter = 0;

export const route: Route = {
    path: '/search',
    name: 'Web Search',
    example: '/parallel/search',
    categories: ['other'],
    maintainers: ['georgeatparallel'],
    features: {
        requireConfig: [
            { name: 'PARALLEL_SEARCH_QUERY', optional: false, description: 'One public web search query for a private, personal RSSHub instance.' },
            { name: 'ACCESS_KEY', optional: false, description: 'Protect the instance before enabling this feed.' },
        ],
    },
    url: 'parallel.ai/mcp',
    description:
        'On a private RSSHub instance with a memory or Redis cache, set `ACCESS_KEY` and `PARALLEL_SEARCH_QUERY` (for example, `site:nasa.gov Artemis mission updates`), then subscribe to `/parallel/search` using [RSSHub access control](https://docs.rsshub.app/deploy/config#access-control). This route sends that query to [Parallel](https://parallel.ai/mcp) and caches the results for six hours. Use it for a personal feed and keep the instance and subscription private.',
    handler,
};

async function search(query: string) {
    if (Date.now() < retryAfter) {
        throw new Error('Parallel Search is rate limited. Try again later.');
    }

    const signal = AbortSignal.timeout(Math.min(config.requestTimeout, 15000));
    const client = new Client({ name: 'RSSHub', version: '1.0.0' });
    const transport = new StreamableHTTPClientTransport(endpoint, {
        requestInit: { headers: { 'User-Agent': userAgent }, redirect: 'error' },
        reconnectionOptions: { initialReconnectionDelay: 1000, maxReconnectionDelay: 1000, reconnectionDelayGrowFactor: 1, maxRetries: 0 },
        fetch: async (input, options) => {
            const deadline = options?.method === 'DELETE' ? AbortSignal.timeout(1500) : signal;
            const response = await fetch(input, {
                ...options,
                redirect: 'error',
                signal: options?.signal ? AbortSignal.any([options.signal, deadline]) : deadline,
            });
            if (response.status === 429) {
                const retryHeader = response.headers.get('Retry-After');
                const seconds = retryHeader ? Number(retryHeader) : NaN;
                const serverRetryAfter = Number.isFinite(seconds) ? Date.now() + seconds * 1000 : Date.parse(retryHeader ?? '');
                retryAfter = Math.max(Date.now() + refreshSeconds * 1000, serverRetryAfter || 0);
            }
            return response;
        },
    });

    try {
        await client.connect(transport);
        const result = await client.callTool({ name: 'web_search', arguments: { objective: `Find recent public web pages about: ${query}`, search_queries: [query] } }, { signal });
        if (result.isError === true) {
            throw new TypeError('Parallel Search could not complete the query.');
        }
        const { results } = resultSchema.parse(result.structuredContent);
        const items = new Map<string, DataItem>();
        for (const result of results) {
            const url = new URL(result.url);
            if (url.username || url.password || items.has(url.href)) {
                continue;
            }
            items.set(url.href, {
                title: result.title || url.hostname,
                link: url.href,
                description: result.excerpts.map((excerpt) => `<p>${encodeXML(excerpt)}</p>`).join(''),
                pubDate: result.publish_date ? parseDate(`${result.publish_date}T00:00:00Z`).toUTCString() : undefined,
            });
        }
        if (items.size === 0) {
            throw new Error('Parallel Search returned no public results.');
        }
        return items.values().toArray();
    } finally {
        try {
            await transport.terminateSession();
        } catch {
            logger.debug('Parallel Search session termination did not complete.');
        } finally {
            await client.close();
        }
    }
}

async function handler(ctx: Context): Promise<Data> {
    const query = config.parallelSearchQuery;
    const accessKey = config.accessKey;
    if (!query || query.length > 200 || !accessKey || !cache.status.available || !cache.globalCache.supportsAtomicClaims) {
        throw new ConfigNotFoundError('Parallel Search needs a PARALLEL_SEARCH_QUERY of up to 200 characters, an ACCESS_KEY, and an active memory or Redis cache.');
    }

    const scope = createHmac('sha256', accessKey).update(query).digest('hex');
    if (pending?.scope !== scope) {
        const key = `parallel:search:${scope}`;
        const result = cache.tryGet(
            key,
            async () => {
                // A failed refresh still consumes this window, even with concurrent readers or a shared Redis cache.
                if (!(await cache.globalCache.claim(`${key}:refresh`, refreshSeconds))) {
                    throw new Error('Parallel Search is waiting for the next refresh window.');
                }
                return search(query);
            },
            refreshSeconds,
            false
        );
        pending = { scope, result };
    }
    const current = pending;
    const self = new URL(ctx.req.url);
    self.searchParams.delete('key');
    self.searchParams.delete('code');
    try {
        return {
            item: await current.result,
            title: `Parallel Search: ${query}`,
            link: 'https://parallel.ai/mcp',
            atomlink: self.href,
            private: true,
            ttl: refreshSeconds / 60,
        };
    } finally {
        if (pending === current) {
            pending = undefined;
        }
    }
}
