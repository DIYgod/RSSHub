# IMPL-04: `bubble` Route

> **Target file**: `lib/routes/spec/bubble.ts`  
> **Auth**: `BUBBLE_COOKIE` — session cookie from an authenticated Bubble session  
> **Cache TTL**: 2 min  
> **Puppeteer**: No

## Design notes

Bubble (DearU bubble) REST API: `https://api.bubblem.io/`.

```
GET /v1/rooms/:artistId/messages?limit=20&sort=desc
```

Authentication is via the `Cookie` header. `artistId` is the numeric room id from `bubble.us/channel/:artistId`.

## Route file (design)

```typescript
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import type { SpecExtraBubble } from '@/types/spec-extra';
import { cache } from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { assertEnv, buildCacheKey, throwAuthError } from './utils';

const BUBBLE_API = 'https://api.bubblem.io';

type BubbleMessageType = 'TEXT' | 'IMAGE' | 'VIDEO';

interface BubbleMessage {
    messageId: string;
    artistId: string;
    roomId: string;
    messageType: BubbleMessageType;
    body?: string;
    thumbnailUrl?: string;
    mediaUrl?: string;
    createdAt?: string;
    artist?: { name?: string; profileImageUrl?: string };
}

interface BubbleMessagesResponse {
    messages?: BubbleMessage[];
}

function messageTypeLabel(raw: BubbleMessageType): SpecExtraBubble['messageType'] {
    const map: Record<BubbleMessageType, SpecExtraBubble['messageType']> = {
        TEXT: 'text',
        IMAGE: 'image',
        VIDEO: 'video',
    };
    return map[raw] ?? 'text';
}

export const route: Route = {
    path: '/bubble/:artistId',
    categories: ['social-media'],
    example: '/spec/bubble/12345',
    parameters: {
        artistId: 'Bubble artist room ID — numeric. Visible in the Bubble app URL.',
    },
    features: {
        requireConfig: [
            {
                name: 'BUBBLE_COOKIE',
                optional: false,
                description: 'Session cookie from an authenticated DearU Bubble session. Obtain via DevTools → Application → Cookies.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    url: 'bubble.us',
    name: 'Artist Room Messages',
    maintainers: ['koreanpatch'],
    radar: [
        {
            source: ['bubble.us/channel/:artistId', 'bubble.us/@:artistId'],
            target: '/spec/bubble/:artistId',
        },
    ],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const artistId = ctx.req.param('artistId');
    const cookie = assertEnv('BUBBLE_COOKIE', 'ERR_BUBBLE_COOKIE_MISSING');

    const data = await cache.tryGet(
        buildCacheKey('bubble', artistId),
        2 * 60, // 2 min
        async () => {
            try {
                return (await ofetch(`${BUBBLE_API}/v1/rooms/${artistId}/messages`, {
                    query: { limit: 20, sort: 'desc' },
                    headers: { Cookie: cookie },
                })) as BubbleMessagesResponse;
            } catch (err: any) {
                if (err?.response?.status === 401 || err?.response?.status === 403) {
                    throwAuthError('ERR_BUBBLE_COOKIE_EXPIRED', 'BUBBLE_COOKIE has expired. Renew and redeploy.');
                }
                throw err;
            }
        }
    );

    const messages: BubbleMessage[] = (data as BubbleMessagesResponse).messages ?? [];
    const artistName = messages[0]?.artist?.name ?? `Artist ${artistId}`;

    const items: DataItem[] = messages.map((msg) => {
        const link = `https://bubble.us/channel/${artistId}/message/${msg.messageId}`;
        const thumb = msg.thumbnailUrl ?? msg.artist?.profileImageUrl ?? '';
        const pubDate = parseDate(msg.createdAt ?? '');
        const msgType = messageTypeLabel(msg.messageType);

        const extra: SpecExtraBubble = {
            type: 'bubble/message',
            platform: 'bubble',
            sourceUrl: link,
            externalId: msg.messageId,
            seriesExternalId: artistId,
            publishedAt: pubDate ? pubDate.toISOString() : undefined,
            artistId,
            bubbleRoomId: msg.roomId ?? artistId,
            messageType: msgType,
        };

        const bodySnippet = msg.body?.slice(0, 100) ?? '';

        return {
            title: bodySnippet ? `${artistName}: ${bodySnippet}${msg.body && msg.body.length > 100 ? '…' : ''}` : `${artistName} — ${msgType}`,
            link,
            guid: `spec-bubble-${artistId}-${msg.messageId}`,
            pubDate,
            image: thumb,
            description: [thumb ? `<img src="${thumb}" />` : '', msg.body ? `<p>${msg.body}</p>` : ''].filter(Boolean).join('\n'),
            _extra: extra,
        };
    });

    return {
        title: `${artistName} — Bubble`,
        link: `https://bubble.us/channel/${artistId}`,
        item: items,
        language: 'ko',
    };
}
```
