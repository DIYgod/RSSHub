import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['travel'],
    example: '/guangzhoumetro/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻',
    maintainers: ['HankChow'],
    handler,
};

async function handler() {
    const newsUrl = 'https://www.gzmtr.com/ygwm/xwzx/gsxw/';
    const response = await got(newsUrl);
    const data = response.data;

    const $ = load(data);
    const list = $('ul.ag_h_w li')
        .map((_, item) => {
            item = $(item);
            const url = newsUrl + item.find('a').attr('href').slice(2);
            const title = item.find('a').text();
            const publishTime = parseDate(item.find('span').text());
            return {
                title,
                link: url,
                author: '广州地铁',
                pubtime: publishTime,
            };
        })
        .get();

    return {
        title: '广州地铁新闻',
        url: newsUrl,
        description: '广州地铁新闻',
        item: list.map((item) => ({
            title: item.title,
            pubDate: item.pubtime,
            link: item.link,
            author: item.author,
        })),
    };
}
