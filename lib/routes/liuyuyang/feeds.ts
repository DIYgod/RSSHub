import { load } from 'cheerio';
import { config } from '@/config';
import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const host = 'https://liuyuyang.net';
export const route: Route = {
    path: '/feeds',
    categories: ['blog'],
    example: '/liuyuyang/feeds',
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
            source: ['liuyuyang.net/'],
        },
    ],
    name: '宇阳',
    maintainers: ['a180285'],
    handler,
    url: 'liuyuyang.net',
};

async function handler() {
    const response = await ofetch(String(host), {
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const $ = load(response);
    const items = $('.space-y-4 > div')
        .toArray()
        .map((item) => {
            item = $(item);
            const link = item.find('a').first();
            const title = item.find('h3').first().text();
            const description = item.find('p').first().text();
            const pubTime = item.find('div.text-white').first().find('span').last().text();
            const heatDegree = item.find('div.text-white').eq(1).find('span').last().text();
            const category = item.find('div.text-white').last().find('span').last().text();

            return {
                title,
                link: `${host}${link.attr('href')}`,
                description,
                pubDate: parseDate(pubTime),
                category,
                popularity: Number(heatDegree),
            };
        });
    return {
        title: '宇阳 - 花有重开日, 人无再少年。',
        link: String(host),
        item: items,
    };
}
