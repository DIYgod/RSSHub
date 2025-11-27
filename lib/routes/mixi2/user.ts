import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import { type Data, type Route, ViewType } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { CONFIG_OPTIONS, getClient, parsePost, postFilter } from './utils';

const handler = async (ctx: Context) => {
    const limit = Number.parseInt(ctx.req.query('limit') ?? '20', 10);
    const name = ctx.req.param('name');
    const mediaOnly = ctx.req.param('media') === 'media';

    if (!name.startsWith('@')) {
        throw new InvalidParameterError('ユーザー名は@で始まる必要があります');
    }

    const client = getClient();

    const userInfo = await client.getPersonaByName({
        name: name.slice(1),
    });

    const persona = userInfo.persona;

    const data = await client.getPersonalTimeline({
        personaId: persona?.personaId,
        limit,
        mediaOnly,
    });

    return {
        title: `${persona?.name} - ${mediaOnly ? 'メディア' : 'ポスト'}`,
        image: persona?.avatarUrl,
        item:
            data?.posts?.filter(postFilter).map((post) => ({
                title: `@${persona?.name}`,
                description: parsePost(post),
                pubDate: parseDate(post.createdAt.seconds * 1e3),
                guid: post.postId,
                author: persona?.name,
                link: `https://mixi.social/@${persona?.name}/posts/${post.postId}`,
            })) ?? [],
    } as Data;
};

export const route: Route = {
    path: '/user/:name/:media?',
    name: 'ユーザー',
    categories: ['social-media'],
    example: '/mixi2/user/@deyo',
    parameters: {
        name: {
            description: '@で始まるユーザー名',
        },
        media: {
            description: '`media`を入力するとメディアを含むポストのみを取得、デフォルトは空で全てのポストを取得',
        },
    },
    features: {
        requireConfig: CONFIG_OPTIONS,
        supportRadar: true,
    },
    radar: [
        {
            source: ['mixi.social/:id'],
            target: '/user/:id',
            title: 'ユーザー - ポスト',
        },
        {
            source: ['mixi.social/:id'],
            target: '/user/:id/media',
            title: 'ユーザー - メディア',
        },
    ],
    view: ViewType.SocialMedia,
    handler,
    maintainers: ['KarasuShin'],
};
