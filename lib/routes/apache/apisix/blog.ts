import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

async function getArticles() {
    const url = 'https://apisix.apache.org/zh/blog/';
    const { data: res } = await got(url);
    const $ = load(res);
    const articles = $('a.post-card');
    return articles.toArray().map((elem) => {
        const a = $(elem);
        const [date, author] = a.find('.meta').text().split('·', 2);
        return {
            title: a.find('h3').text(),
            description: a.find('.desc').text(),
            link: new URL(a.attr('href')!, url).href,
            pubDate: parseDate(date.trim(), 'YYYY年M月D日'),
            author: author?.trim(),
            category: a.find('.cover-fallback span').text() || undefined,
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
