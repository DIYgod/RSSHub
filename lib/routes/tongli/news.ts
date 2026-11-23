import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

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

async function getArticleContent(link: string): Promise<Pick<DataItem, 'description'>> {
    const { data } = await got(link);
    const $ = load(data);
    if (link.startsWith('https://tonglinv.pixnet.net/')) {
        return { description: $('.article-content-inner').html() };
    }
    if (/^https?:\/\/blog\.xuite\.net\//.test(link)) {
        return { description: $('#content_all').html() };
    }
    if (/TNews_View\.aspx/.test(link)) {
        return { description: $('#ContentPlaceHolder1_TNewsContent').html() };
    }
    return { description: '' };
}

async function handler(ctx) {
    const { type } = ctx.req.param();
    const baseURL = 'https://www.tongli.com.tw/';
    const url = `${baseURL}TNews_List.aspx`;
    const searchParams = { Type: type, Page: 1 };
    const { data: res } = await got(url, {
        searchParams,
    });
    const link = new URL(url);
    link.searchParams.set('Type', type);
    link.searchParams.set('Page', '1');
    const $ = load(res);

    const list = $('.news_list ul li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('.title a');
            return {
                title: a.text(),
                link: a.attr('href')!.startsWith('http') ? a.attr('href') : baseURL + a.attr('href'),
                pubDate: parseDate($item.find('.date').text(), 'YYYY.MM.DD', 8),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const article = await cache.tryGet(`tongli:article:${item.link}`, () => getArticleContent(item.link!));
            return { ...item, description: article.description };
        },
        { concurrency: 3 }
    );

    return {
        title: $('.entry_title .n1').text(),
        link: link.href,
        item: items,
    };
}
