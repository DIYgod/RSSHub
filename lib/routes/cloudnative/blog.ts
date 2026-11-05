import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://cloudnative.jimmysong.io';

async function getArticles() {
    const url = `${rootUrl}/blog/`;
    const { data: res } = await got(url);
    const $ = load(res);
    const articles = $('div.page-body .stream-item');
    return articles.toArray().map((elem) => {
        const a = $(elem).find('.article-title > a');
        const summary = $(elem).find('.summary-link');
        const meta = $(elem).find('.stream-meta .article-metadata');
        const time = meta.find('.article-date').text().replace('发布于', '').trim();
        return {
            title: a.text(),
            link: new URL(a.attr('href')!, rootUrl).href,
            description: summary.text(),
            pubDate: timezone(parseDate(time, 'YYYY-MM-DD'), 8),
            author: meta.find('span').eq(0).find('a').text(),
            category: meta
                .find('.article-categories a')
                .toArray()
                .map((category) => $(category).text()),
        };
    });
}

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/cloudnative/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '博客',
    maintainers: ['aneasystone'],
    handler,
};

async function handler() {
    const articles = await getArticles();
    return {
        title: '博客 | 云原生社区（中国）',
        link: `${rootUrl}/blog/`,
        item: articles,
    };
}
