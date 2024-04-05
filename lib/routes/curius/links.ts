import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/links/:name',
    categories: ['social-media'],
    example: '/curius/links/yuu-yuu',
    parameters: { name: 'Username, can be found in URL' },
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
            source: ['curius.app/:name'],
        },
    ],
    name: 'User',
    maintainers: ['Ovler-Young'],
    handler,
};

async function handler(ctx) {
    const username = ctx.req.param('name');

    const name_response = await got(`https://curius.app/api/users/${username}`, {
        headers: {
            Referer: `https://curius.app/${username}`,
        },
    });

    const data = name_response.data;

    const uid = data.user.id;
    const name = `${data.user.firstName} ${data.user.lastName}`;

    const response = await got(`https://curius.app/api/users/${uid}/links?page=0`, {
        headers: {
            Referer: `https://curius.app/${username}`,
        },
    });

    const items = response.data.userSaved.map((item) => ({
        title: item.title,
        description: art(path.join(__dirname, 'templates/description.art'), {
            item,
        }),
        link: item.link,
        pubDate: parseDate(item.createdDate),
        guid: `curius:${username}:${item.id}`,
    }));

    return {
        title: `${name} - Curius`,
        link: `https://curius.app/${username}`,
        description: `${name} - Curius`,
        allowEmpty: true,
        item: items,
    };
}
