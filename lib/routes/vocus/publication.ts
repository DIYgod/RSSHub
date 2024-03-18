import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { processList, ProcessFeed, baseUrl, apiUrl } from './utils';

export const route: Route = {
    path: '/publication/:id',
    categories: ['social-media'],
    example: '/vocus/publication/bass',
    parameters: { id: '出版專題 id，可在出版專題主页的 URL 找到' },
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
            source: ['vocus.cc/:id/home', 'vocus.cc/:id/introduce'],
        },
    ],
    name: '出版專題',
    maintainers: ['Maecenas'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const link = `${baseUrl}/${id}/home`;

    const publicationData = await cache.tryGet(`vocus:publication:${id}`, async () => {
        const { data: publicationData } = await got(`${apiUrl}/api/publication/${id}`, {
            headers: {
                referer: link,
            },
        });
        return {
            _id: publicationData._id,
            title: publicationData.title,
            abstract: publicationData.abstract,
        };
    });

    const {
        data: { articles },
    } = await got(`${apiUrl}/api/articles`, {
        headers: {
            referer: link,
        },
        searchParams: {
            publicationId: publicationData._id,
        },
    });

    const list = processList(articles);

    const items = await ProcessFeed(list, cache.tryGet);

    return {
        title: `${publicationData.title} - 文章列表｜方格子 vocus`,
        link,
        description: publicationData.abstract,
        item: items,
    };
}
