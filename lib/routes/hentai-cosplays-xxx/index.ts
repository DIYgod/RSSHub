import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:type?/:name?',
    categories: ['picture'],
    example: '/hentai-cosplays-xxx/tag/jk',
    parameters: {
        type: '搜索类型, `tag`为标签, `keyword`为关键字, 默认留空为全部',
        name: '搜索内容, 可在 URL 中找到，默认留空为全部',
    },
    features: {
        antiCrawler: true,
    },
    name: '最新图片',
    maintainers: ['hoilc'],
    handler,
};

const host = 'https://ja.hentai-cosplay-xxx.com/';

async function handler(ctx: Context) {
    const { type, name } = ctx.req.param();
    const url = type ? `${host}search/${type}/${encodeURIComponent(name)}/` : `${host}search/`;

    const response = await ofetch(url);
    const $ = load(response);

    const list = $('#display_area_image')
        .first()
        .find('ul#image-list li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.image-list-item-title').text().trim(),
                link: host + 'story' + $item.find('.image-list-item-title > a').attr('href')!.replace('/image', ''),
                date: $item.find('.image-list-item-regist-date > span').text(),
            };
        });

    const items = await Promise.all(
        list.map((info) =>
            cache.tryGet(info.link, async () => {
                const detailResponse = await ofetch(info.link.replace('https://ja.hentai-cosplay-xxx.com/', 'https://hentai-cosplay-xxx.com/'));
                const $ = load(detailResponse);
                $('#custom-bookend-scrollable').remove();
                return {
                    title: info.title,
                    link: info.link,
                    description: $('amp-img')
                        .toArray()
                        .map((element) => `<img src=${$(element).attr('src')} alt="">`)
                        .join(' '),
                    pubDate: parseDate(info.date),
                };
            })
        )
    );

    return {
        title: `${name || '新着画像一覧'} - エロ画像`,
        link: url,
        item: items,
    };
}
