import type { Route } from '@/types';
import got from '@/utils/got';

import { generateData } from './utils';

export const route: Route = {
    path: '/people/pins/:id',
    categories: ['social-media'],
    example: '/zhihu/people/pins/kan-dan-45',
    parameters: { id: '作者 id，可在用户主页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.zhihu.com/people/:id/pins'],
        },
    ],
    name: '用户想法',
    maintainers: ['xyqfer'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const {
        data: { data },
    } = await got({
        method: 'get',
        url: `https://api.zhihu.com/pins/${id}/moments?limit=10&offset=0`,
    });

    return {
        title: `${data[0].target.author.name}的知乎想法`,
        link: `https://www.zhihu.com/people/${id}/pins`,
        item: generateData(data),
    };
}
