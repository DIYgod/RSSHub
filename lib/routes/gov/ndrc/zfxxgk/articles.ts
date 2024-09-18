import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/ndrc/zfxxgk/iteminfo',
    categories: ['government'],
    example: '/gov/ndrc/zfxxgk/iteminfo',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '国家发展改革委 - 政府信息公开',
    maintainers: ['howfool'],
    handler,
    url: 'zfxxgk.ndrc.gov.cn/web/dirlist.jsp',
};

async function handler() {
    const homeUrl = 'https://zfxxgk.ndrc.gov.cn/web/dirlist.jsp';
    const rootUrl = 'https://zfxxgk.ndrc.gov.cn/web/';

    const response = await got({
        method: 'get',
        url: homeUrl,
    });

    const $ = load(response.data);

    let items = $('div.zwgk-right .zwxxkg-result tr')
        .toArray()
        .slice(1)
        .map((item) => {
            item = $(item);

            return {
                title: item.find('a').text().replace(/^\s*/, ''),
                link: rootUrl + item.find('a').attr('href'),
                data: item.find('td:last').text(),
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
                content('[class$="top"]').remove();
                item.description = content('.zwgkbg').html();
                item.pubDate = parseDate(item.data);

                return item;
            })
        )
    );

    return {
        title: '国家发展改革委 - 政府信息公开',
        link: homeUrl,
        item: items,
    };
}
