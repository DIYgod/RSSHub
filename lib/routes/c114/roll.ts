import { load } from 'cheerio';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const handler = async (ctx) => {
    const { original = 'false' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const rootUrl = 'https://www.c114.com.cn';
    const currentUrl = new URL(`news/roll.asp${original === 'true' ? `?o=true` : ''}`, rootUrl).href;

    const { data: response } = await got(currentUrl, {
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response, 'gbk'));

    const language = $('html').prop('lang');

    let items = $('div.new_list_c')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('h6 a').text(),
                pubDate: timezone(parseDate(item.find('div.new_list_time').text(), ['HH:mm', 'M/D']), +8),
                link: new URL(item.find('h6 a').prop('href'), rootUrl).href,
                author: item.find('div.new_list_author').text().trim(),
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link, {
                    responseType: 'buffer',
                });

                const $$ = load(iconv.decode(detailResponse, 'gbk'));

                const title = $$('h1').text();
                const description = $$('div.text').html();

                item.title = title;
                item.description = description;
                item.pubDate = timezone(parseDate($$('div.r_time').text(), 'YYYY/M/D HH:mm'), +8);
                item.author = $$('div.author').first().text().trim();
                item.content = {
                    html: description,
                    text: $$('.text').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const image = new URL($('div.top2-1 a img').prop('src'), rootUrl).href;

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('p.top1-1-1 a').first().text(),
        language,
    };
};

export const route: Route = {
    path: '/roll/:original?',
    name: '滚动资讯',
    url: 'c114.com.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/c114/roll',
    parameters: { original: '只看原创，可选 true 和 false，默认为 false' },
    description: '',
    categories: ['new-media'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['c114.com.cn/news/roll.asp'],
            target: (_, url) => {
                url = new URL(url);
                const original = url.searchParams.get('o');

                return `/roll${original ? `/${original}` : ''}`;
            },
        },
    ],
};
