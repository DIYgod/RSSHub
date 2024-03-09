import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

async function getArticles() {
    const url = 'https://apisix.apache.org/zh/blog/';
    const { data: res } = await got(url);
    const $ = load(res);
    const articles = $('section.sec_gjjg').eq(1).find('article');
    return articles.toArray().map((elem) => {
        const a = $(elem).find('header > a');
        return {
            title: a.find('h2').text(),
            description: a.find('p').text(),
            link: a.attr('href'),
            pubDate: parseDate($(elem).find('footer').find('time').attr('datetime')),
            category: $(elem)
                .find('header div a')
                .toArray()
                .map((elem) => $(elem).text()),
        };
    });
}

export const route: Route = {
    path: '/apisix/blog',
    categories: ['blog'],
    example: '/apache/apisix/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'APISIX 博客',
    maintainers: ['aneasystone'],
    handler,
};

async function handler() {
    const articles = await getArticles();
    return {
        title: 'Blog | Apache APISIX',
        link: 'https://apisix.apache.org/zh/blog/',
        item: articles,
    };
}
