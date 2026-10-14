import { html } from 'hono/html';
import MarkdownIt from 'markdown-it';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const apiUrl = 'https://api.lens.xyz/graphql';
const lensNamespace = '0x1aA55B9042f08f45825dC4b651B64c9F98Af4615';
const markdown = new MarkdownIt();

type Media = { __typename?: string; item: string; cover?: string; altTag?: string; title?: string };
type Metadata = { content?: string; title?: string; tags?: string[]; image?: Media; video?: Media; audio?: Media; asset?: Media; attachments?: Media[]; raw?: string };
type Post = { id: string; slug: string; timestamp?: string; isDeleted: boolean; metadata: Metadata; repostOf?: Post };
type Account = { address: string; username?: { localName: string }; metadata?: { name?: string; bio?: string; picture?: string } };
type GraphqlResult<T> = { data?: T; errors?: Array<{ message: string }> };

const profileQuery = 'query Profile($request: AccountRequest!) { account(request: $request) { address username { localName } metadata { name bio picture } } }';
const postsQuery =
    'query Posts($request: PostsRequest!) { posts(request: $request) { items { __typename ... on Post { ...PostFields } ... on Repost { id slug timestamp isDeleted repostOf { ...PostFields } } } } }\nfragment PostFields on Post { id slug timestamp isDeleted metadata { ...MetadataFields } }\nfragment MetadataFields on PostMetadata { __typename ... on ArticleMetadata { content tags title attachments { ...MediaFields } } ... on AudioMetadata { content tags title audio { item cover title type } attachments { ...MediaFields } } ... on CheckingInMetadata { content tags attachments { ...MediaFields } } ... on EmbedMetadata { content tags attachments { ...MediaFields } } ... on EventMetadata { content tags title attachments { ...MediaFields } } ... on ImageMetadata { content tags title image { item altTag type } attachments { ...MediaFields } } ... on LinkMetadata { content tags attachments { ...MediaFields } } ... on LivestreamMetadata { content tags title attachments { ...MediaFields } } ... on MintMetadata { content tags attachments { ...MediaFields } } ... on SpaceMetadata { content tags title attachments { ...MediaFields } } ... on StoryMetadata { content tags asset { ...MediaFields } } ... on TextOnlyMetadata { content tags } ... on ThreeDMetadata { content tags attachments { ...MediaFields } } ... on TransactionMetadata { content tags attachments { ...MediaFields } } ... on VideoMetadata { content tags title video { item cover type } attachments { ...MediaFields } } ... on UnknownPostMetadata { raw } }\nfragment MediaFields on AnyMedia { __typename ... on MediaImage { item altTag type } ... on MediaVideo { item cover type } ... on MediaAudio { item cover title type } }';

const request = async <T>(query: string, variables: object): Promise<T> => {
    const result = await ofetch<GraphqlResult<T>>(apiUrl, { method: 'POST', body: { query, variables } });
    if (result.errors?.length || !result.data) {
        throw new Error(`Lens API request failed: ${result.errors?.map((error) => error.message).join('; ') || 'No response data'}`);
    }
    return result.data;
};

const renderMedia = (media: Media | undefined, kind = media?.__typename): string => {
    if (!media?.item) {
        return '';
    }
    switch (kind) {
        case 'MediaVideo':
            return String(html`<video controls src="${media.item}" poster="${media.cover || ''}"></video>`);
        case 'MediaAudio':
            return String(html`<audio controls src="${media.item}"></audio>`);
        default:
            return String(html`<img src="${media.item}" alt="${media.altTag || ''}" />`);
    }
};

export const route: Route = {
    path: '/profile/:handle',
    categories: ['social-media'],
    example: '/lens/profile/stani',
    parameters: { handle: 'Lens handle' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['hey.xyz/u/:handle'],
            target: '/profile/:handle',
        },
    ],
    name: 'Profile',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const handle = ctx.req.param('handle');
    const { account } = await request<{ account?: Account }>(profileQuery, { request: { username: { localName: handle, namespace: lensNamespace } } });
    if (!account) {
        throw new Error(`Lens profile "${handle}" was not found. Check the Lens handle.`);
    }
    const { posts } = await request<{ posts: { items: Post[] } }>(postsQuery, { request: { filter: { authors: [account.address], postTypes: ['ROOT', 'REPOST', 'QUOTE'] }, pageSize: 'FIFTY' } });

    return {
        title: `${account.metadata?.name || account.username?.localName || handle} on Lens`,
        description: account.metadata?.bio,
        image: account.metadata?.picture,
        link: `https://hey.xyz/u/${handle}`,
        item: posts.items
            .filter((post) => !post.isDeleted)
            .slice(0, 25)
            .map((post) => {
                const original = post.repostOf || post;
                const metadata: Metadata = original.metadata.raw ? JSON.parse(original.metadata.raw) : original.metadata;
                const content = metadata.content || '';
                return {
                    title: metadata.title || content || 'No content',
                    description:
                        (post.repostOf ? '<p>Mirrored:</p>' : '') +
                        markdown.render(content) +
                        renderMedia(metadata.image, 'MediaImage') +
                        renderMedia(metadata.video, 'MediaVideo') +
                        renderMedia(metadata.audio, 'MediaAudio') +
                        renderMedia(metadata.asset) +
                        (metadata.attachments || []).map((media) => renderMedia(media)).join(''),
                    link: `https://hey.xyz/posts/${post.slug}`,
                    pubDate: post.timestamp ? parseDate(post.timestamp) : undefined,
                    guid: post.id,
                    author: account.metadata?.name || handle,
                    category: metadata.tags,
                };
            }),
    };
}
