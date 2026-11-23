import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateStrict } from '@/utils/time';

export const route: Route = {
    path: '/sy/whyw',
    categories: ['government'],
    example: '/gov/wuhan/sy/whyw',
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
            source: ['wuhan.gov.cn/sy/whyw/', 'wuhan.gov.cn/whyw', 'wuhan.gov.cn/'],
        },
    ],
    name: '要闻',
    maintainers: ['nczitzk'],
    handler,
    url: 'wuhan.gov.cn/sy/whyw/',
};

async function handler() {
    const rootUrl = 'http://www.wuhan.gov.cn';
    const currentUrl = `${rootUrl}/sy/whyw/`;
    const response = await got(currentUrl);

    const $ = load(response.data);

    const list = $('.articleList li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');
            const date = $item
                .find('.time')
                .contents()
                .filter((_, node) => node.type === 'text')
                .text()
                .trim();
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, currentUrl).href,
                pubDate: parseDateStrict(date, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD'], 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.description = content('.article .TRS_UEDITOR').html();
                item.author = content('meta[name=ContentSource]').attr('content');
                item.pubDate = parseDateStrict(content('meta[name="PubDate"]').prop('content'), ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm'], 8);

                return item;
            })
        )
    );

    return {
        title: `${$('h2').text()} - 武汉市人民政府`,
        link: currentUrl,
        item: items,
    };
}
