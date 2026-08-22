import { escape } from 'entities';
import type { Context } from 'hono';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/comments/:id',
    categories: ['programming'],
    example: '/patchwork.kernel.org/comments/10723629',
    parameters: {
        id: 'Patch ID',
    },
    name: 'Patch Comments',
    maintainers: ['ysc3839'],
    handler,
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();

    const name = await cache.tryGet(`patchwork-kernel-org-patchname-from-id-${id}`, async () => {
        const patchDetail = await ofetch(`https://patchwork.kernel.org/api/patches/${id}/`, {
            headers: {
                accept: 'application/json',
                'user-agent': config.trueUA,
            },
        });
        return patchDetail.name;
    });

    const data = await ofetch(`https://patchwork.kernel.org/api/patches/${id}/comments/`, {
        query: {
            order: '-date',
        },
        headers: {
            accept: 'application/json',
            'user-agent': config.trueUA,
        },
    });

    return {
        title: `${name} - Comments`,
        link: `https://patchwork.kernel.org/patch/${id}/`,
        item: data.map((item) => ({
            title: item.subject,
            description: escape(item.content).replaceAll('\n', '<br>'),
            pubDate: parseDate(item.date),
            link: item.web_url,
        })),
    };
}
