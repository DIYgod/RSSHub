import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/video',
    categories: ['finance'],
    example: '/futunn/video',
    features: {
        supportRadar: true,
    },
    radar: [
        {
            source: ['news.futunn.com/main/video-list', 'news.futunn.com/:lang/main/video-list'],
            target: '/video',
        },
    ],
    name: '视频',
    maintainers: ['kennyfong19931'],
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const rootUrl = 'https://news.futunn.com';
    const link = `${rootUrl}/main/video-list`;
    const apiUrl = `${rootUrl}/news-site-api/main/get-video-list?size=${limit}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.data.videoList.list.map((item) => ({
        title: item.title,
        description: renderDescription({
            abs: item.abstract,
            pic: item.videoImg,
        }),
        link: item.targetUrl,
        pubDate: parseDate(item.timestamp * 1000),
    }));

    return {
        title: '富途牛牛 - 视频',
        link,
        item: items,
    };
}
