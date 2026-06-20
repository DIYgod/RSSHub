import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:type',
    categories: ['reading'],
    example: '/tongli/news/6',
    parameters: { type: '分類，可以在“新聞”鏈接中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新聞',
    maintainers: ['CokeMine'],
    handler,
};

async function handler(ctx) {
    const { type } = ctx.req.param();
    const baseURL = 'https://www.tongli.com.tw/';
    const url = `${baseURL}TNews_List.aspx`;
    const { data: res, url: link } = await got(url, {
        searchParams: {
            Type: type,
            Page: 1,
        },
    });
    const $ = cheerio.load(res);

    const list = $('.news_list ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('.title a');
            return {
                title: a.text(),
                link: a.attr('href').startsWith('http') ? a.attr('href') : baseURL + a.attr('href'),
                pubDate: parseDate(item.find('.date').text(), 'YYYY.MM.DD'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: res } = await got(item.link);
                const $ = cheerio.load(res);

                if (item.link.startsWith('https://tonglinv.pixnet.net/')) {
                    item.description = $('.article-content-inner').html();
                } else if (/^https?:\/\/blog\.xuite\.net\//.test(item.link)) {
                    item.description = $('#content_all').html();
                } else if (/TNews_View\.aspx/.test(item.link)) {
                    item.description = $('#ContentPlaceHolder1_TNewsContent').html();
                } else {
                    item.description = '';
                }

                return item;
            })
        )
    );

    return {
        title: $('.entry_title .n1').text(),
        link,
        item: items,
    };
}
