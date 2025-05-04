import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import cache from '@/utils/cache';

const url = 'https://bakamh.com';

const handler = async (ctx) => {
    const { name } = ctx.req.param();
    const limit = Number.parseInt(ctx.req.query('limit'), 15) || 15;

    const link = `${url}/manga/${name}/`;
    const response = await ofetch(link);
    const $ = cheerio.load(response);

    const list = $('li.wp-manga-chapter > a')
        .toArray()
        .slice(0, limit)
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: $item.attr('href'),
                guid: $item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = cheerio.load(response);
                const comicpage = $('div.reading-content img');
                const containerDiv = $('<div class="image-container"></div>');
                comicpage.appendTo(containerDiv);
                item.description = $.html(containerDiv);
                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link,
        description: $('.post-content_item p').text(),
        image: $('.summary_image a img').attr('src'),
        item: items,
    };
};

export const route: Route = {
    path: '/manga/:name',
    categories: ['anime'],
    example: 'bakamh/manga/最强家丁',
    parameters: { name: '漫画名称，漫画主页的地址栏中' },
    radar: [
        {
            source: ['bakamh.com/manga/:name/'],
        },
    ],
    name: '漫画更新',
    maintainers: ['yoyobase'],
    handler,
    url: 'bakamh.com',
};