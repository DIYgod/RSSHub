import { Data, Route } from '@/types';
import type { Context } from 'hono';
import { CONFIG_OPTIONS, getClient, parsePost } from './utils';
import { parseDate } from '@/utils/parse-date';

const handler = async (ctx: Context) => {
    const limit = Number.parseInt(ctx.req.query('limit') ?? '20', 10);
    const idOrName = ctx.req.param('id');
    const mediaOnly = ctx.req.param('media') === 'media';

    let personaId: string;
    let personaName: string;
    let personaAvatar: string;

    const client = getClient();

    if (idOrName.startsWith('@')) {
        personaName = idOrName.slice(1);
        const userInfo = await client.getPersonaByName({
            name: idOrName.slice(1),
        });

        personaId = userInfo.persona.personaId;
        personaAvatar = userInfo.persona.avatarUrl;
    } else {
        const personasData = await client.getPersonas({
            personaIds: [idOrName],
        });

        personaId = idOrName;
        personaName = personasData.personas[0].name;
        personaAvatar = personasData.personas[0].avatarUrl;
    }

    const data = await client.getPersonalTimeline({
        personaId,
        limit,
        mediaOnly,
    });

    return {
        title: `${personaName} - ${mediaOnly ? 'メディア' : 'ポスト'}`,
        image: personaAvatar,
        item:
            data?.posts
                ?.filter((post) => !post.isDeleted)
                .map((post) => ({
                    title: `@${personaName}`,
                    description: parsePost(post),
                    pubDate: parseDate(post.createdAt.seconds * 1e3),
                    guid: post.postId,
                })) ?? [],
    } as Data;
};

export const route: Route = {
    path: '/user/:id/:media?',
    name: 'ユーザー',
    categories: ['social-media'],
    example: '/mixi2/user/@deyo',
    parameters: {
        id: {
            description: 'ユーザーIDまたは@で始まるユーザー名',
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
    handler,
    maintainers: ['KarasuShin'],
};
