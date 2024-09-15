import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/huiyi',
    categories: ['government'],
    example: '/gwyzzjg/huiyi',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '国务院工作会议',
    maintainers: ['howfool'],
    handler,
    url: 'www.gov.cn/gwyzzjg/huiyi/',
};

async function handler() {
    const rootUrl = 'https://www.gov.cn/gwyzzjg/huiyi/';

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = load(response.data);

    let items = $('div.news_box h4')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.children('a').text(),
                link: item.children('a').attr('href'),
                data: item.children('span').text(),
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

                item.description = content('.trs_editor_view').html();
                item.pubDate = parseDate(item.data);

                return item;
            })
        )
    );

    return {
        title: '国务院工作会议 - 中国政府网',
        link: rootUrl,
        item: items,
    };
}
