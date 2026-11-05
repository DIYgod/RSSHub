import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const host = 'https://computer.hdu.edu.cn/12269/list.htm';

const getSingleRecord = async () => {
    const res = await got(host);

    const $ = load(res.data);
    const list = $('.col_news_list .jzlb');

    return list.toArray().map((item) => {
        const $item = $(item);
        const date = $item.find('.fbsj4').text();
        return {
            title: $item.find('.btt3 a').text(),
            pubDate: date ? parseDateInTimezone(date, 8) : undefined,
            link: new URL($item.find('.btt3 a').attr('href')!, host).href,
        };
    });
};

export const route: Route = {
    path: '/cs',
    categories: ['university'],
    example: '/hdu/cs',
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
            source: ['computer.hdu.edu.cn/12269/list.htm'],
        },
    ],
    name: '计算机学院 - 通知公告',
    maintainers: ['legr4ndk'],
    handler,
    url: 'computer.hdu.edu.cn/12269/list.htm',
};

async function handler() {
    const items = await getSingleRecord();
    const out = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                const article = $('.wp_articlecontent');
                article.find('.wp_pdf_player[pdfsrc]').each((_, element) => {
                    const player = $(element);
                    const url = new URL(player.attr('pdfsrc')!, item.link).href;
                    player.replaceWith(
                        $('<a>')
                            .attr('href', url)
                            .text(player.attr('id') || 'PDF')
                    );
                });
                return {
                    title: item.title,
                    link: item.link,
                    description: article.html(),
                    pubDate: item.pubDate,
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: '杭电计算机-通知公告',
        description: '杭州电子科技大学计算机学院-通知公告',
        link: host,
        item: out,
    };
}
