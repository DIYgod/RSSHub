import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseURL = 'https://www.tokeninsight.com/';
const title = 'TokenInsight';
const link = 'https://www.tokeninsight.com/';
const get_articles = async () => {
    const url = `${baseURL}api/bulletin/selectBulletinList`;
    const response = (await got.get(url)).data;
    const { data } = response;
    return data;
};

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
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const lang = ctx.req.param('lang') ?? 'zh';

    const get_article_info = async (article) => {
        const { updateDate, titleEn, id, title } = article;
        const articleUrl = `${baseURL}${lang}/latest/${id}`;
        const description = await cache.tryGet(articleUrl, async () => {
            const res = await got(articleUrl);
            const $ = load(res.data);
            return $('.detail_html_box').html();
        });
        return {
            // 文章标题
            title: lang === 'zh' ? title : titleEn,
            // 文章正文
            description,
            // 文章发布时间
            pubDate: parseDate(updateDate),
            // 文章链接
            link: articleUrl,
        };
    };

    const articles = await get_articles();
    const list = await Promise.all(articles.map((element) => get_article_info(element)));
    return {
        title: `${lang === 'zh' ? '快讯' : 'Latest'} | ${title}`,
        link: `${link}${lang}/latest`,
        item: list,
    };
}
