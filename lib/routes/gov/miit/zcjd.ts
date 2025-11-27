import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.miit.gov.cn';
const siteUrl = `${baseUrl}/zwgk/zcjd/index.html`;

export const route: Route = {
    path: '/miit/zcjd',
    categories: ['government'],
    example: '/gov/miit/zcjd',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '政策解读',
    maintainers: ['Yoge-Code'],
    handler,
};

async function handler() {
    const response = await got(siteUrl);
    const $ = load(response.data);
    const buildStatic = $('script[parseType=buildstatic]');
    const requestUrl = buildStatic.attr('url');
    const queryData = JSON.parse(buildStatic.attr('querydata').replaceAll("'", '"'));

    const { data } = await got(`${baseUrl}${requestUrl}`, {
        headers: {
            referer: siteUrl,
        },
        searchParams: queryData,
    });
    const list = load(data.data.html, null, false);

    let items = list('.page-content ul li')
        .toArray()
        .map((item) => {
            item = list(item);
            return {
                title: item.find('a').attr('title'),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.fr').text(), 'YYYY-MM-DD'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = load(data);

                $('iframe').each((_, e) => {
                    e = $(e);
                    if (e.attr('src').startsWith('/')) {
                        e.attr('src', new URL(e.attr('src'), baseUrl).href);
                    }
                });
                item.author = $('.cinfo')
                    .text()
                    .match(/来源：(.*)/)[1];
                item.pubDate = timezone(parseDate($('#con_time').text(), 'YYYY-MM-DD HH:mm'), +8);
                item.description = $('.ccontent').html();

                return item;
            })
        )
    );

    return {
        title: `${$('head title').text()} - ${$('meta[name=SiteName]').attr('content')}`,
        link: siteUrl,
        item: items,
    };
}
