import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

const siteUrl = 'https://xxgk.dhu.edu.cn';
const baseUrl = 'https://xxgk.dhu.edu.cn/1737/list.htm';

export const route: Route = {
    path: '/xxgk/news',
    categories: ['university'],
    example: '/dhu/xxgk/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最新信息公开',
    maintainers: ['KiraKiseki'],
    handler,
};

async function handler() {
    const link = baseUrl;
    const { data: response } = await got(link);

    const $ = load(response);

    const items = await Promise.all(
        $('.cols_list > li')
            .toArray()
            .map(async (item) => {
                item = $(item);
                const colsTitle = item.find('.cols_title > a');
                const colsMeta = item.find('.cols_meta');

                // article meta
                const link = colsTitle.attr('href');
                const title = colsTitle.text();
                const pubDate = parseDate(colsMeta.text(), 'YYYY-MM-DD', 'zh-cn');

                // fetch article content and return item using cache.tryGet
                // url as cache key
                const url = `${siteUrl}${link}`;
                return await cache.tryGet(url, async () => {
                    // fetch article content
                    // some contents are only available for internal network
                    let description = '';
                    try {
                        const { data: response } = await got(url);
                        const $ = load(response);
                        description = $('.wp_articlecontent').first().html() ?? '';
                    } catch {
                        description = '';
                    }

                    return {
                        title,
                        link,
                        pubDate,
                        description,
                    };
                });
            })
    );

    return {
        title: '东华大学信息公开网-最新公开信息',
        link,
        item: items,
    };
}
