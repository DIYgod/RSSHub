import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseURL = 'https://www.tokeninsight.com/';
const title = 'TokenInsight';
const link = 'https://www.tokeninsight.com/';
const getArticles = async () => {
    const url = `${baseURL}api/bulletin/selectBulletinList`;
    const { data } = (await got.get(url)).data;
    return data;
};

const getArticle = (url: string) =>
    cache.tryGet(`tokeninsight:article:${url}`, async () => {
        const response = await got(url);
        const $ = load(response.data);
        return { description: $('.detail_html_box').html() ?? '' };
    });

export const route: Route = {
    path: '/bulletin/:lang?',
    categories: ['finance'],
    example: '/tokeninsight/bulletin/en',
    parameters: { lang: 'Language, see below, Chinese by default' },
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
            source: ['tokeninsight.com/:lang/latest'],
            target: '/bulletin/:lang',
        },
    ],
    name: 'Latest',
    maintainers: ['fuergaosi233'],
    handler,
};

async function handler(ctx) {
    const lang = ctx.req.param('lang') ?? 'zh';

    const getArticleInfo = async (article): Promise<DataItem> => {
        const { updateDate, titleEn, id, title } = article;
        const articleUrl = `${baseURL}${lang}/latest/${id}`;
        const { description } = await getArticle(articleUrl);
        return {
            title: lang === 'zh' ? title : titleEn,
            description,
            pubDate: updateDate ? parseDate(updateDate) : undefined,
            link: articleUrl,
        };
    };

    const articles = await getArticles();
    const list = await pMap(articles, (element) => getArticleInfo(element), { concurrency: 3 });
    return {
        title: `${lang === 'zh' ? '快讯' : 'Latest'} | ${title}`,
        link: `${link}${lang}/latest`,
        item: list,
    };
}
