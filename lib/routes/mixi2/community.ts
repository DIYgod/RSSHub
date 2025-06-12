import { type Data, type Route, ViewType } from '@/types';
import type { Context } from 'hono';
import { getClient, parsePost } from './utils';
import { parseDate } from '@/utils/parse-date';

const handler = async (ctx: Context) => {
    const limit = Number.parseInt(ctx.req.query('limit') ?? '20', 10);
    const communityId = ctx.req.param('id');
    const mediaOnly = ctx.req.param('media') === 'media';

    const client = getClient();

    const [communityInfo, postsData] = await Promise.all([
        client.getCommunity({
            communityId,
        }),
        client.getCommunityTimeline({
            communityId,
            limit,
            mediaOnly,
        }),
    ]);

    return {
        title: `${communityInfo.community.name} - ${mediaOnly ? 'メディア' : 'ポスト'}`,
        image: communityInfo.community.coverImage.postImage?.largeImageUrl,
        item:
            postsData?.posts
                ?.filter((post) => !post.isDeleted)
                .map((post) => ({
                    title: communityInfo.community.name,
                    description: parsePost(post),
                    pubDate: parseDate(post.createdAt.seconds * 1e3),
                    guid: post.postId,
                })) ?? [],
    } as Data;
};

export const route: Route = {
    path: '/community/:id/:media?',
    name: 'コミュニティ',
    categories: ['social-media'],
    example: '/mixi2/community/62e7e813-d242-4c54-a0ee-0aab5b2bbad2',
    parameters: {
        id: {
            description: 'コミュニティID',
        },
        media: {
            description: '`media`を入力するとメディアを含むポストのみを取得、デフォルトは空で全てのポストを取得',
        },
    },
    features: {
        supportRadar: true,
    },
    radar: [
        {
            source: ['mixi.social/communities/:id', 'mixi.social/communities/:id/about'],
            target: '/community/:id',
            title: 'コミュニティ - ポスト',
        },
        {
            source: ['mixi.social/communities/:id', 'mixi.social/communities/:id/about'],
            target: '/community/:id/media',
            title: 'コミュニティ - メディア',
        },
    ],
    view: ViewType.SocialMedia,
    handler,
    maintainers: ['KarasuShin'],
};
