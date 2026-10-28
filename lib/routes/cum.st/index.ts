import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const BASE_URL = 'https://cum.st';
const API_URL = `${BASE_URL}/api/v1`;
const EDGE_BASE_URLS = ['https://e1.cum.st', 'https://e2.cum.st', 'https://e3.cum.st'];
const IMG_BASE_URL = 'https://img.cum.st';

interface MediaAttachment {
    locked: boolean;
    kind?: string;
    storageKey?: string;
    variants?: Array<{ name: string }> | null;
}

interface ContentItem {
    id: string;
    service: string;
    creatorId?: string;
    creatorName?: string;
    title?: string | null;
    captionText?: string | null;
    captionHtml?: string | null;
    contentText?: string | null;
    contentHtml?: string | null;
    published?: number;
    attachments?: MediaAttachment[];
}

interface CreatorProfile {
    name: string;
    displayName: string | null;
}

const renderMedia = (attachments: MediaAttachment[] = []): Array<{ html: string; image?: string }> =>
    attachments
        .map((attachment) => {
            const variant = attachment.variants?.find((variant) => variant.name.startsWith('original.')) ?? attachment.variants?.[0];
            if (attachment.locked || !attachment.storageKey || !variant) {
                return;
            }
            const key = encodeURIComponent(attachment.storageKey);
            const edge = EDGE_BASE_URLS[Math.floor(Math.random() * EDGE_BASE_URLS.length)];
            const src = `${edge}/media/${key}/${encodeURIComponent(variant.name)}`;
            switch (attachment.kind) {
                case 'image':
                case 'gif':
                    return { html: `<p><img src="${src}"></p>`, image: src };
                case 'video': {
                    const poster = `${IMG_BASE_URL}/thumbnail/${key}/preview.webp`;
                    return { html: `<p><video controls preload="metadata" src="${src}" poster="${poster}"></video></p>`, image: poster };
                }
                case 'audio':
                    return { html: `<p><audio controls preload="metadata" src="${src}"></audio></p>` };
                default:
                    return;
            }
        })
        .filter((media) => media !== undefined);

const makeItem = (item: ContentItem, isDm: boolean, creatorId?: string, creatorName?: string): DataItem => {
    const id = item.creatorId ?? creatorId;
    if (!id) {
        throw new Error('OnlyHeaven did not provide a creator ID for this item.');
    }
    const author = item.creatorName ?? creatorName;
    const kind = isDm ? 'dm' : 'post';
    const media = renderMedia(item.attachments);
    const text = isDm ? item.contentText : item.captionText;

    return {
        title: (!isDm && item.title) || text || `${isDm ? 'DM' : 'Post'} ${item.id}`,
        description: ((isDm ? item.contentHtml : item.captionHtml) ?? (text ? `<p>${text}</p>` : '')) + media.map((m) => m.html).join(''),
        image: media.find((m) => m.image)?.image,
        author,
        pubDate: item.published === undefined ? undefined : parseDate(item.published, 'X'),
        link: `${BASE_URL}/creators/${item.service}/${encodeURIComponent(id)}/${kind}/${encodeURIComponent(item.id)}`,
        guid: `cum.st:${item.service}:${id}:${kind}:${item.id}`,
    };
};

const handler: Route['handler'] = async (ctx) => {
    const { service, id, type } = ctx.req.param();
    const isGlobal = !service || service === 'posts' || service === 'dms';
    if (isGlobal ? id || type : !['onlyfans', 'fansly', 'patreon'].includes(service) || !id || (type && type !== 'dms')) {
        throw new InvalidParameterError('Use /cum.st/posts, /cum.st/dms, or /cum.st/:service/:id[/dms] (service: onlyfans, fansly, or patreon).');
    }

    const isDm = service === 'dms' || type === 'dms';
    const kind = isDm ? 'dms' : 'posts';
    const creatorApiPath = isGlobal ? '' : `/${service}/user/${encodeURIComponent(id)}`;
    const [feed, profile] = await Promise.all([
        ofetch<Record<typeof kind, ContentItem[]>>(`${API_URL}${creatorApiPath}/${kind}`),
        isGlobal ? undefined : cache.tryGet<CreatorProfile>(`cum.st:${creatorApiPath}/profile`, () => ofetch<CreatorProfile>(`${API_URL}${creatorApiPath}/profile`)),
    ]);
    const creatorName = profile?.displayName || profile?.name;

    return {
        title: isGlobal ? `OnlyHeaven ${isDm ? 'DMs' : 'Posts'}` : `${isDm ? 'DMs' : 'Posts'} of ${creatorName} from ${service} | OnlyHeaven`,
        link: isGlobal ? `${BASE_URL}/${kind}` : `${BASE_URL}/creators/${service}/${encodeURIComponent(id)}${isDm ? '?tab=dms' : ''}`,
        image: isGlobal ? undefined : `${IMG_BASE_URL}/creator/${service}/${encodeURIComponent(id)}/avatar.webp`,
        item: feed[kind].map((item) => makeItem(item, isDm, id, creatorName)),
    };
};

export const route: Route = {
    path: '/:service?/:id?/:type?',
    categories: ['multimedia'],
    example: '/cum.st/posts',
    parameters: {
        service: 'Platform (`onlyfans`, `fansly`, or `patreon`), or `posts` / `dms` for the latest posts / DMs across all creators (defaults to `posts`)',
        id: 'Creator ID from the creator URL; required when a platform is specified',
        type: 'Use `dms` for the creator’s DMs; defaults to posts',
    },
    features: { nsfw: true },
    radar: [
        { source: ['cum.st/posts'], target: '/posts' },
        { source: ['cum.st/dms'], target: '/dms' },
        { source: ['cum.st/creators/:service/:id'], target: '/:service/:id' },
    ],
    name: 'Posts and DMs',
    maintainers: ['gekangen'],
    handler,
    description: `Sources

| Latest posts | Latest DMs | OnlyFans creator | Fansly creator | Patreon creator |
| ------------ | ---------- | ---------------- | -------------- | --------------- |
| posts        | dms        | onlyfans         | fansly         | patreon         |

::: tip
When **service** is \`posts\` or \`dms\`, **id** is not used. For a creator, use \`/cum.st/onlyfans/CREATOR_ID\` for posts or \`/cum.st/onlyfans/CREATOR_ID/dms\` for DMs. Replace \`onlyfans\` with \`fansly\` or \`patreon\` for other creators. Available images are included in the feed entries.
:::`,
};
