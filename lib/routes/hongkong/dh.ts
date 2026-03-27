import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/dh/:language?',
    categories: ['government'],
    example: '/hongkong/dh',
    parameters: { language: 'Language, see below, tc_chi by default' },
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
            source: ['dh.gov.hk/'],
        },
    ],
    name: 'Press Release',
    maintainers: ['nczitzk'],
    handler,
    url: 'dh.gov.hk/',
    description: `Language

| English | 中文简体 | 中文繁體 |
| ------- | -------- | -------- |
| english | chs      | tc_chi  |`,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'tc_chi';

    const rootUrl = 'https://www.dh.gov.hk';
    const currentUrl = `${rootUrl}/${language}/press/press.html`;
    const textonlyUrl = `${rootUrl}/textonly/${language}/press/press.html`;

    const response = await got({
        method: 'get',
        url: textonlyUrl,
    });

    const $ = load(response.data);

    let items = $('td[headers="title"]')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.find('a').attr('href'),
                pubDate: parseDate(item.next().text(), language === 'english' ? 'D-MMMM-YYYY' : 'YYYY年M月D日'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('#pressrelease').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
