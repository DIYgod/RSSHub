import { load } from 'cheerio';
import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'http://www.wzu.edu.cn/index/';

const newsType = {
    wdxw: '温大新闻',
    mtwd: '媒体温大',
    xswd: '学术温大',
    tzgg: '通知公告',
    zbxx: '招标信息',
    xsgg: '学术公告',
};

async function loadContent(link: string): Promise<Pick<DataItem, 'description' | 'author'>> {
    const newsResp = await got.get(link);
    const $ = load(newsResp.data);
    const author = $('.ny-content-title > span')
        .text()
        .match(/作者[：:](.*?)(?=(?:浏览次数|发布时间)[：:]|$)/s)?.[1]
        .trim();
    // Resolve relative image links.
    $('img').each((_, element) => {
        const image = $(element);
        const src = image.attr('src');
        if (src) {
            image.attr('src', new URL(src, link).href);
        }
    });
    // Replace the source video player with a video element.
    $('.vsbcontent_video').each((_, el) => {
        const src = $(el).find('script').attr('vurl');
        $(el).html(src ? `<video width="100%" src="${new URL(src, link).href}"></video>` : '');
    });
    return {
        description: $('div[id^=vsb_content]').html() ?? '',
        author: author || undefined,
    };
}

export const route: Route = {
    path: '/news/:type?',
    categories: ['university'],
    example: '/wzu/news/0',
    parameters: { type: '分类，见下表 默认为`0`' },
    description: `| 温大新闻 | 媒体温大 | 学术温大 | 通知公告 | 招标信息 | 学术公告 |
| :------: | :------: | :------: | :------: | :------: | :------: |
|     0    |     1    |     2    |     3    |     4    |     5    |`,
    name: '新闻',
    maintainers: ['Chandler-Lu'],
    handler,
};

async function handler(ctx) {
    const routeTag = Number.parseInt(ctx.req.param('type')) || 0;
    const newsArr = Object.entries(newsType);
    const selected = newsArr[routeTag];
    if (!selected) {
        throw new NotFoundError(`Unsupported news type: ${routeTag}`);
    }
    const [k1, newsTitle] = selected;
    const newsLink = new URL(k1 + '.htm', baseUrl).href;

    const response = await got.get(newsLink);
    const $ = load(response.data);
    const list = $('#News-sidebar-b-nav').find('li');

    return {
        title: newsTitle,
        link: newsLink,
        description: `温州大学 - ${newsTitle}`,
        item: await pMap(
            list.toArray().filter((item) => $(item).children('a').attr('href')),
            async (item): Promise<DataItem> => {
                const $item = $(item);
                const $a1 = $item.children('a');
                const $originUrl = $a1.attr('href');
                const $itemUrl = new URL($originUrl!, baseUrl).href;
                const rawDate = $item.children('samp').text();
                const pubDate = rawDate ? timezone(parseDate(rawDate, 'YYYY-MM-DD', true), 8) : undefined;
                const detail = await cache.tryGet(`wzu:detail:v3:${$itemUrl}`, () => loadContent($itemUrl));
                return {
                    title: $a1.attr('title') ?? '',
                    description: detail.description,
                    author: detail.author,
                    pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
                    link: $itemUrl,
                };
            },
            { concurrency: 3, stopOnError: false }
        ),
    };
}
