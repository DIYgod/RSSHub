import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const BASE_URL = 'https://cum.st';
const API_URL = `${BASE_URL}/api/v1`;
const MEDIA_URL = 'https://e1.cum.st/media';

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
    captionHtml?: string | null;
    contentHtml?: string | null;
    published?: number;
    attachments?: MediaAttachment[];
}

interface ContentFeed {
    posts?: ContentItem[];
    dms?: ContentItem[];
}

interface CreatorProfile {
    name: string;
    displayName: string | null;
}

const imageUrls = (attachments: MediaAttachment[] = []): string[] =>
    attachments.flatMap((attachment) => {
        if (attachment.locked || !['image', 'gif'].includes(attachment.kind ?? '') || !attachment.storageKey) {
            return [];
        }
        const variant = attachment.variants?.find((variant) => variant.name.startsWith('original.')) ?? attachment.variants?.[0];
        return variant ? [`${MEDIA_URL}/${encodeURIComponent(attachment.storageKey)}/${encodeURIComponent(variant.name)}`] : [];
    });

const makeItem = (item: ContentItem, isDm: boolean, creatorId?: string, creatorName?: string): DataItem => {
    const id = item.creatorId ?? creatorId;
    if (!id) {
        throw new Error('OnlyHeaven did not provide a creator ID for this item.');
    }
    const author = item.creatorName ?? creatorName;
    const kind = isDm ? 'dm' : 'post';
    const images = imageUrls(item.attachments);

    return {
        title: (!isDm && item.title) || `${isDm ? 'DM' : 'Post'} ${item.id}`,
        description: ((isDm ? item.contentHtml : item.captionHtml) ?? '') + images.map((url) => `<p><img src="${url}"></p>`).join(''),
        image: images[0],
        author,
        pubDate: item.published === undefined ? undefined : parseDate(item.published, 'X'),
        link: `${BASE_URL}/creators/${item.service}/${encodeURIComponent(id)}/${kind}/${encodeURIComponent(item.id)}`,
        guid: `onlyheaven:${item.service}:${id}:${kind}:${item.id}`,
    };
};

const handler: Route['handler'] = async (ctx) => {
    const { service, id, type } = ctx.req.param();
    const isGlobal = !service || service === 'posts' || service === 'dms';
    if (isGlobal ? id || type : !['onlyfans', 'fansly', 'patreon'].includes(service) || !id || (type && type !== 'dms')) {
        throw new InvalidParameterError('Use /onlyheaven/posts, /onlyheaven/dms, or /onlyheaven/:service/:id[/dms] (service: onlyfans, fansly, or patreon).');
    }

    const isDm = service === 'dms' || type === 'dms';
    const kind = isDm ? 'dms' : 'posts';
    const creatorApiPath = isGlobal ? '' : `/${service}/user/${encodeURIComponent(id)}`;
    const [feed, profile] = await Promise.all([ofetch<ContentFeed>(`${API_URL}${creatorApiPath}/${kind}`), isGlobal ? undefined : ofetch<CreatorProfile>(`${API_URL}${creatorApiPath}/profile`)]);
    const creatorName = profile?.displayName || profile?.name;
    const entries = isDm ? feed.dms : feed.posts;
    if (!Array.isArray(entries)) {
        throw new TypeError(`OnlyHeaven did not return a ${kind} feed.`);
    }

    return {
        title: isGlobal ? `OnlyHeaven ${isDm ? 'DMs' : 'Posts'}` : `${isDm ? 'DMs' : 'Posts'} of ${creatorName} from ${service} | OnlyHeaven`,
        link: isGlobal ? `${BASE_URL}/${kind}` : `${BASE_URL}/creators/${service}/${encodeURIComponent(id)}${isDm ? '/dms' : ''}`,
        item: entries.map((item) => makeItem(item, isDm, id, creatorName)),
    };
};

export const route: Route = {
    path: '/:service?/:id?/:type?',
    categories: ['multimedia'],
    example: '/onlyheaven/posts',
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
        { source: ['cum.st/creators/:service/:id/dms'], target: '/:service/:id/dms' },
    ],
    name: 'Posts and DMs',
    maintainers: ['gekangen'],
    handler,
    description: `Sources

| Latest posts | Latest DMs | OnlyFans creator | Fansly creator | Patreon creator |
| ------------ | ---------- | ---------------- | -------------- | --------------- |
| posts        | dms        | onlyfans         | fansly         | patreon         |

::: tip
When **service** is \`posts\` or \`dms\`, **id** is not used. For a creator, use \`/onlyheaven/onlyfans/CREATOR_ID\` for posts or \`/onlyheaven/onlyfans/CREATOR_ID/dms\` for DMs. Replace \`onlyfans\` with \`fansly\` or \`patreon\` for other creators. Available images are included in the feed entries.
:::`,
};
