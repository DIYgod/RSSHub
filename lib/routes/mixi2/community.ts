import type { Context } from 'hono';

import { type Data, type Route, ViewType } from '@/types';

import { CONFIG_OPTIONS, generatePostDataItem, getClient, postFilter } from './utils';

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

    const personasData = await client.getPersonas({
        personaIds: postsData?.posts.map((post) => post.personaId),
    });

    return {
        title: `${communityInfo.community.name} - ${mediaOnly ? 'メディア' : 'ポスト'}`,
        description: communityInfo.community.purpose.replaceAll('\n', ' '),
        link: `https://mixi.social/communities/${communityId}/about`,
        image: communityInfo.community.coverImage.postImage?.largeImageUrl,
        item:
            postsData?.posts?.filter(postFilter).map((post) => ({
                title: communityInfo.community.name,
                ...generatePostDataItem(post, personasData.personas),
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
        requireConfig: CONFIG_OPTIONS,
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
