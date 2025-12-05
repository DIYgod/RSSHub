import { load } from 'cheerio';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/chapter/:id',
    categories: ['reading'],
    example: '/wenku8/chapter/74',
    parameters: { id: '小说 id, 可在对应小说页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '章节',
    maintainers: ['zsakvo'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const index = Number.parseInt(id / 1000);

    const response = await got({
        method: 'get',
        url: `https://www.wenku8.net/novel/${index}/${id}/index.htm`,
        responseType: 'buffer',
    });

    const responseHtml = iconv.decode(response.data, 'gbk');

    const $ = load(responseHtml);

    const name = $('#title').text();

    const chapter_item = [];

    $('.ccss>a').each(function () {
        chapter_item.push({
            title: $(this).text(),
            link: `https://www.wenku8.net/novel/${index}/${id}/` + $(this).attr('href'),
        });
    });

    return {
        title: `轻小说文库 ${name}`,
        link: `https://www.wenku8.net/book/${id}.htm`,
        item: chapter_item,
    };
}
