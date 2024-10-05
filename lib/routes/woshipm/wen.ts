import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const baseUrl = 'https://wen.woshipm.com';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/wen',
    categories: ['new-media'],
    example: '/woshipm/wen',
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
            source: ['wen.woshipm.com/'],
        },
    ],
    name: '天天问',
    maintainers: ['WenryXu'],
    handler,
    url: 'wen.woshipm.com/',
};

async function handler() {
    const response = await got(`${baseUrl}/m/main/indexNewData.html`);
    const $ = load(response.data);
    const postList = $('.article-list-item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.went-head-text').text(),
                link: `${baseUrl}${item.find('.went-head').attr('href')}`,
                pubDate: parseRelativeDate(item.find('.list-text').text().split('|')[1]),
            };
        });

    const result = await Promise.all(
        postList.map((item) =>
            cache.tryGet(item.link, async () => {
                const temp = await got(item.link);
                const $ = load(temp.data);
                item.description = $('.wt-desc').html();
                return item;
            })
        )
    );

    return {
        title: '天天问 - 人人都是产品经理',
        link: baseUrl,
        item: result,
    };
}
