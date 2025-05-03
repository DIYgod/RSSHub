import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['university'],
    example: '/ahjzu/news',
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
            source: ['news.ahjzu.edu.cn/20/list.htm'],
        },
    ],
    name: '通知公告',
    maintainers: ['Yuk-0v0'],
    handler,
    url: 'news.ahjzu.edu.cn/20/list.htm',
};

async function handler() {
    const rootUrl = 'https://www.ahjzu.edu.cn';
    const currentUrl = 'https://www.ahjzu.edu.cn/20/list.htm';

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('#wp_news_w9')
        .find('li')
        .toArray()
        .map((item) => {
            item = $(item);
            const date = item.find('.column-news-date').text();

            // 置顶链接自带http前缀，其他不带，需要手动判断
            const a = item.find('a').attr('href');
            const link = a.slice(0, 4) === 'http' ? a : rootUrl + a;
            return {
                title: item.find('a').attr('title'),
                link,
                pubDate: timezone(parseDate(date), +8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);
                const post = content('.wp_articlecontent').html();

                item.description = post;
                return item;
            })
        )
    );

    return {
        title: '安建大-通知公告',
        description: '安徽建筑大学-通知公告',
        link: currentUrl,
        item: items,
    };
}
