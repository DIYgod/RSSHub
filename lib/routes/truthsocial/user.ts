import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';

const ORIGIN = 'https://truthsocial.com';
const API_BASE = `${ORIGIN}/api`;

export const route: Route = {
    path: '/user/:username/:routeParams?',
    categories: ['social-media'],
    example: '/truthsocial/user/realDonaldTrump',
    parameters: {
        username: 'Truth Social handle, without the leading `@`',
        routeParams: 'Extra params: `replies=1` include replies, `reblogs=0` exclude re-Truths',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['truthsocial.com/@:username'],
            target: '/user/:username',
        },
    ],
    name: 'User Timeline',
    maintainers: ['syncmeta'],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const { username } = ctx.req.param();
    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
    const includeReplies = routeParams.get('replies') === '1';
    const includeReblogs = routeParams.get('reblogs') !== '0';
    const limit = Number(ctx.req.query('limit') ?? '20');

    // Truth Social sits behind Cloudflare, which fingerprints TLS/JA3 and blocks
    // plain HTTP clients. A real (stealth) browser session clears the challenge,
    // gets the cf cookie, then does same-origin fetches against the JSON API.
    const context = await playwright();
    let account;
    let statuses;
    try {
        const page = await context.newPage();
        await page.route('**/*', (route) => {
            // Only HTML/XHR are needed to clear Cloudflare; drop heavy assets.
            ['image', 'media', 'font', 'stylesheet'].includes(route.request().resourceType()) ? route.abort() : route.continue();
        });

        logger.http(`Requesting ${ORIGIN}/@${username}`);
        // `networkidle` gives Cloudflare's challenge JS time to run and set the
        // clearance cookie before we touch the API.
        await page.goto(`${ORIGIN}/@${username}`, { waitUntil: 'networkidle' });

        // Inside the page context, same-origin fetch carries the Cloudflare cookie.
        // A fresh challenge can take a moment to clear, so retry on 403/503.
        const apiFetch = (url: string): Promise<any> =>
            page.evaluate(
                async ({ u, retries }) => {
                    for (let i = 0; i <= retries; i++) {
                        // eslint-disable-next-line no-await-in-loop
                        const res = await fetch(u, { headers: { accept: 'application/json' }, credentials: 'include' });
                        if (res.ok) {
                            return res.json();
                        }
                        if ((res.status === 403 || res.status === 503) && i < retries) {
                            // eslint-disable-next-line no-await-in-loop
                            await new Promise((resolve) => setTimeout(resolve, 3000));
                            continue;
                        }
                        throw new Error(`HTTP ${res.status}`);
                    }
                },
                { u: url, retries: 3 }
            );

        account = await cache.tryGet(`truthsocial:account:${username}`, () => apiFetch(`${API_BASE}/v1/accounts/lookup?acct=${encodeURIComponent(username)}`));

        const params = new URLSearchParams({ exclude_replies: String(!includeReplies), limit: String(limit) });
        statuses = await apiFetch(`${API_BASE}/v1/accounts/${account.id}/statuses?${params}`);
    } finally {
        await context.close();
    }

    const items: DataItem[] = (statuses as any[])
        .filter((status) => includeReblogs || !status.reblog)
        .map((status) => {
            const source = status.reblog ?? status;
            const isReblog = Boolean(status.reblog);

            const media = (source.media_attachments ?? [])
                .map((m) => {
                    if (m.type === 'image') {
                        return `<img src="${m.url}">`;
                    }
                    if (m.type === 'video' || m.type === 'gifv') {
                        return `<video src="${m.url}" controls poster="${m.preview_url ?? ''}"></video>`;
                    }
                    return '';
                })
                .join('');

            let description = source.content || '';
            if (source.card) {
                description += `<br><a href="${source.card.url}">${source.card.title || source.card.url}</a>`;
            }
            description += media;

            return {
                title: `${isReblog ? `Re-Truth @${source.account?.username}: ` : ''}${textTitle(source.content)}`,
                description,
                link: source.url || status.url,
                guid: status.uri || status.url,
                pubDate: parseDate(status.created_at),
                author: `@${source.account?.username ?? username}`,
                category: source.tags?.map((t: { name: string }) => t.name),
            };
        });

    return {
        title: `${account.display_name || account.username} (@${account.username}) - Truth Social`,
        link: account.url || `${ORIGIN}/@${username}`,
        description: account.note,
        image: account.avatar,
        item: items,
        allowEmpty: true,
    };
}

function textTitle(html: string): string {
    const text = (html || '')
        .replaceAll(/<[^>]+>/g, ' ')
        .replaceAll(/\s+/g, ' ')
        .trim();
    return text.length > 100 ? `${text.slice(0, 100)}…` : text || '(no text)';
}
