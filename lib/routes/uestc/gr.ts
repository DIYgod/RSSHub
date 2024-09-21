import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://gr.uestc.edu.cn/tongzhi/';
const baseIndexUrl = 'https://gr.uestc.edu.cn';

export const route: Route = {
    path: '/gr',
    categories: ['university'],
    example: '/uestc/gr',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['gr.uestc.edu.cn/'],
        },
    ],
    name: '研究生院',
    maintainers: ['huyyi', 'mobyw'],
    handler,
    url: 'gr.uestc.edu.cn/',
};

async function handler() {
    const response = await got.get(baseIndexUrl);

    const $ = load(response.data);

    const items = [];
    $('[href^="/tongzhi/"]').each((_, item) => {
        items.push(baseIndexUrl + item.attribs.href);
    });

    const out = await Promise.all(
        items.map(async (newsUrl) => {
            const newsDetail = await cache.tryGet(newsUrl, async () => {
                const result = await got.get(newsUrl);

                const $ = load(result.data);

                const title = '[' + $('.over').text() + '] ' + $('div.title').text();
                const author = $('.info').text().split('|')[1].trim().substring(3);
                const date = parseDate($('.info').text().split('|')[0].trim().substring(4));
                const description = $('.content').html();

                return {
                    title,
                    link: newsUrl,
                    author,
                    pubDate: date,
                    description,
                };
            });
            return newsDetail;
        })
    );

    return {
        title: '研究生院通知',
        link: baseUrl,
        description: '电子科技大学研究生院通知公告',
        item: out,
    };
}
