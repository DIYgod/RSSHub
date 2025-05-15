import { Route } from '@/types';

import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/news/*',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const rootUrl = 'https://news.ifeng.com';
    const currentUrl = `${rootUrl}${getSubPath(ctx).replace(/^\/news/, '')}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const newsStream = JSON.parse(response.data.match(/"newsstream":(\[.*?]),"cooperation"/)[1]);

    let items = newsStream.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.url,
        pubDate: timezone(parseDate(item.newsTime), +8),
        description: item.thumbnails.image.pop(),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                item.author = detailResponse.data.match(/"editorName":"(.*?)",/)[1];
                item.category = detailResponse.data.match(/},"keywords":"(.*?)",/)[1].split(',');
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: item.description,
                    description: JSON.parse(detailResponse.data.match(/"contentList":(\[.*?]),/)[1]).map((content) => content.data),
                });
                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
