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

    // article list
    const articleList = $('.cols_list > li')
        .toArray()
        .map((item) => {
            item = $(item);
            const cols_title = item.find('.cols_title > a');
            const cols_meta = item.find('.cols_meta');

            const link = cols_title.attr('href');
            const title = cols_title.text();
            const pubDate = parseDate(cols_meta.text(), 'YYYY-MM-DD', 'zh-cn');
            return {
                title,
                link,
                pubDate,
                description: '',
            };
        });

    // fetch article content
    const items = await Promise.all(
        articleList.map(async (item) => {
            const url = `${siteUrl}${item.link}`;

            await cache.tryGet(url, async () => {
                // some contents are only available for internal network
                try {
                    const { data: response } = await got(url);
                    const $ = load(response);
                    const description = $('.wp_articlecontent').first().html();
                    item.description = description ?? '';
                } catch {
                    item.description = '';
                }
                return item;
            });
            return item;
        })
    );

    return {
        title: '东华大学信息公开网-最新公开信息',
        link,
        item: items,
    };
}
