import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/zfcxjst/gsgg',
    categories: ['government'],
    example: '/gov/yunnan/zfcxjst/gsgg',
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
            source: ['zfcxjst.yn.gov.cn/ywdt/gsgg/'],
            target: '/zfcxjst/gsgg',
        },
    ],
    name: '住房和城乡建设厅 - 公示公告',
    maintainers: ['Junior0679'],
    handler,
    url: 'zfcxjst.yn.gov.cn/ywdt/gsgg/',
    description: '云南省住房和城乡建设厅 要闻动态 - 公示公告',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const baseUrl = 'https://zfcxjst.yn.gov.cn';
    const currentUrl = `${baseUrl}/ywdt/gsgg/`;

    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('ul.list > li.list-item')
        .toArray()
        .slice(0, limit)
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a');
            const href = $link.attr('href') || '';

            return {
                title: $item.find('.text').text().trim(),
                link: href.startsWith('http') ? href : new URL(href, currentUrl).href,
                pubDate: parseDate($item.find('.time').text().trim()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detail = await ofetch(item.link);
                const $detail = load(detail);

                const pubDate = $detail('meta[name="PubDate"]').attr('content');

                return {
                    ...item,
                    author: $detail('meta[name="ContentSource"]').attr('content'),
                    pubDate: pubDate ? timezone(parseDate(pubDate), 8) : item.pubDate,
                    description: $detail('.trs_editor_view').html(),
                };
            })
        )
    );

    return {
        title: '云南省住房和城乡建设厅 - 公示公告',
        link: currentUrl,
        item: items,
        description: '云南省住房和城乡建设厅官方网站要闻动态公示公告',
    };
}
