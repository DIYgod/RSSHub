import { Route } from '@/types';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/xwxy-news',
    categories: ['university'],
    example: '/gdufs/xwxy-news',
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
            source: ['xwxy.gdufs.edu.cn/xwzx/xyxw', 'xwxy.gdufs.edu.cn/'],
        },
    ],
    name: '新闻学院-学院新闻',
    maintainers: ['gz4zzxc'],
    handler,
    url: 'xwxy.gdufs.edu.cn/xwzx/xyxw',
};

async function handler() {
    const BASE_URL = 'https://xwxy.gdufs.edu.cn';
    const link = `${BASE_URL}/xwzx/xyxw.htm`;

    const response = await got(link);
    if (!response.body) {
        throw new Error('No response body');
    }
    const $ = load(response.body);
    const list = $('div.flex-center a.clearfix');

    const items = list.toArray().map((element) => {
        const item = $(element);
        const href = item.attr('href') || '';
        const dateText = item.find('i').text().trim();
        const pubDate = parseDate(dateText).toUTCString();
        return {
            title: item.find('h5').text().trim(),
            link: href.startsWith('http') ? href : new URL(href, BASE_URL).href,
            pubDate,
        };
    });

    const enhancedItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const articleResponse = await got(item.link);
                    if (!articleResponse.body) {
                        throw new Error('No article body');
                    }
                    const $$ = load(articleResponse.body);
                    const content = $$('#vsb_content .v_news_content').html() || '';
                    const authors = $$('.show01 p i')
                        .toArray()
                        .map((el) => $$(el).text().trim());

                    return {
                        ...item,
                        description: content,
                        author: authors.join(' '),
                    };
                } catch {
                    return {
                        ...item,
                        description: '无法获取内容',
                        author: '',
                    };
                }
            })
        )
    );

    return {
        title: '广外新传学院-学院新闻',
        link,
        description: '广东外语外贸大学新闻与传播学院官网-学院新闻',
        item: enhancedItems,
    };
}
