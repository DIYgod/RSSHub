import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/notice',
    categories: ['university'],
    example: '/zuel/notice',
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
            source: ['wap.zuel.edu.cn/', 'wap.zuel.edu.cn/notice/list.htm'],
        },
    ],
    name: '通知公告',
    maintainers: ['nczitzk'],
    handler,
    url: 'wap.zuel.edu.cn/',
};

async function handler() {
    const rootUrl = 'http://wap.zuel.edu.cn';
    const currentUrl = `${rootUrl}/notice/list.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.list_item')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('.Article_Title a');

            return {
                title: a.text(),
                pubDate: parseDate(item.find('.Article_PublishDate').text()),
                link: `${a.attr('href').startsWith('http') ? '' : rootUrl}${a.attr('href')}`,
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

                item.description = content('.wp_articlecontent, .psgCont, .infodetail').html();

                return item;
            })
        )
    );

    return {
        title: '中南财经大学 - 通知公告',
        link: currentUrl,
        item: items,
    };
}
