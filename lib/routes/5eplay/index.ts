import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/article',
    categories: ['game'],
    example: '/5eplay/article',
    parameters: {},
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
            source: ['csgo.5eplay.com/', 'csgo.5eplay.com/article'],
        },
    ],
    name: '新闻列表',
    maintainers: ['Dlouxgit'],
    handler,
    url: 'csgo.5eplay.com/',
};

async function handler() {
    const rootUrl = 'https://csgo.5eplay.com/';
    const apiUrl = `${rootUrl}api/article?page=1&type_id=0&time=0&order_by=0`;

    const { data: response } = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await Promise.all(
        response.data.list.map((item) =>
            cache.tryGet(item.jump_link, async () => {
                const { data: detailResponse } = await got({
                    method: 'get',
                    url: item.jump_link,
                });
                const $ = load(detailResponse);

                const content = $('.article-text');
                const res: string[] = [];

                content.find('> p, > blockquote').each((i, e) => {
                    res.push($(e).text());
                    const src = $(e).find('img').first().attr('src');
                    if (src && !src.includes('data:image/png;base64')) {
                        // drop base64 img
                        res.push(`<img src=${src} />`);
                    }
                });

                return {
                    title: item.title,
                    description: res.join('<br />'),
                    pubDate: parseDate(item.dateline * 1000),
                    link: item.jump_link,
                };
            })
        )
    );

    return {
        title: '5EPLAY',
        link: 'https://csgo.5eplay.com/article',
        item: items,
    };
}
