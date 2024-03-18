import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/rule',
    categories: ['finance'],
    example: '/szse/rule',
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
            source: ['szse.cn/lawrules/rule/new', 'szse.cn/'],
        },
    ],
    name: '最新规则',
    maintainers: ['nczitzk'],
    handler,
    url: 'szse.cn/lawrules/rule/new',
};

async function handler() {
    const rootUrl = 'http://www.szse.cn';
    const currentUrl = `${rootUrl}/api/search/content`;

    const response = await got({
        method: 'post',
        url: currentUrl,
        form: {
            keyword: '',
            time: 0,
            range: 'title',
            'channelCode[]': 'szserulesAllRulesBuss',
            currentPage: 1,
            pageSize: 30,
            scope: 0,
        },
    });

    let items = response.data.data.map((item) => ({
        title: item.doctitle,
        link: item.docpuburl,
        pubDate: parseDate(item.docpubtime),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('#desContent').html();

                return item;
            })
        )
    );

    return {
        title: '最新规则 - 深圳证券交易所',
        link: `${rootUrl}/lawrules/rule/new`,
        item: items,
    };
}
