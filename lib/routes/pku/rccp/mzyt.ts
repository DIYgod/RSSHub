import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseUrl = 'https://www.rccp.pku.edu.cn/mzyt/';

export const route: Route = {
    path: '/rccp/mzyt',
    categories: ['university'],
    example: '/pku/rccp/mzyt',
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
            source: ['www.rccp.pku.edu.cn/'],
        },
    ],
    name: '每周一推 - 中国政治学研究中心',
    maintainers: ['vhxubo'],
    handler,
    url: 'www.rccp.pku.edu.cn/',
};

async function handler() {
    const response = await got(baseUrl);

    const $ = load(response.data);
    return {
        title: '每周一推 - 北京大学中国政治学研究中心',
        link: baseUrl,
        description: $('meta[name="description"]').attr('content'),
        item: $('li.list')
            .toArray()
            .map((item) => ({
                title: $(item).find('a').text().trim(),
                description: '',
                pubDate: parseDate($(item).find('span').first().text(), '[YYYY-MM-DD]'),
                link: baseUrl + $(item).find('a').attr('href'),
            })),
    };
}
