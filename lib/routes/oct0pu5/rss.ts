import { Route } from '@/types';
import buildData from '@/utils/common-config';
import got from '@/utils/got';
import { load } from 'cheerio';

const baseUrl = 'https://www.oct0pu5.cn';

export const route: Route = {
    path: '/',
    name: 'Oct的小破站',
    url: 'oct0pu5.cn',
    maintainers: ['octopus058'],
    handler,
    example: '/oct0pu5',
    description: '',
    categories: ['blog'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['oct0pu5.cn'],
            target: '/',
        },
    ],
};

async function handler() {
    const link = `${baseUrl}`;
    return await buildData({
        link,
        url: link,
        title: `%title%`,
        description: `%description%`,
        params: {
            title: '博客',
            description: 'Oct0pu5的博客',
        },
        item: {
            item: 'a.article-title',
            title: `$('a.article-title').attr('title')`,
            link: `$('a.article-title').attr('href')`,
            description: async (itemLink) => {
                const response = await got(itemLink);
                const $ = load(response.body);
                return $('#article-container').text();
            },
            pubDate: `$('a.article-title').attr('href').match(/\\d{4}-\\d{2}-\\d{2}/)[0]`,
        },
    });
}
