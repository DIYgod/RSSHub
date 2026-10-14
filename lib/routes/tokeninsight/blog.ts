import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const baseURL = 'https://www.tokeninsight.com/';
const title = 'TokenInsight';
const link = 'https://www.tokeninsight.com/';

const getArticle = (url: string) =>
    cache.tryGet(`tokeninsight:article:${url}`, async () => {
        const response = await got(url);
        const $ = load(response.data);
        return { description: $('.detail_html_box').html() ?? '' };
    });

export const route: Route = {
    path: '/blog/:lang?',
    categories: ['finance'],
    example: '/tokeninsight/blog/en',
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
            source: ['tokeninsight.com/:lang/blogs'],
            target: '/blog/:lang',
        },
    ],
    name: 'Blogs',
    maintainers: ['fuergaosi233'],
    handler,
};

async function handler(ctx) {
    const lang = ctx.req.param('lang') ?? 'zh';

    const getBlogs = async () => {
        const url = `${baseURL}api/user/search/getAllList`;
        const response = (
            await got.post(url, {
                form: {
                    isRecommend: 2,
                    language: lang === 'zh' ? 'cn' : lang,
                },
            })
        ).data;
        return response.data.blogsList;
    };

    const getBlogInfomation = async (blog): Promise<DataItem> => {
        const { publishDate, title, id } = blog;
        const blogUrl = `${baseURL}${lang}/blogs/${id}`;
        const { description } = await getArticle(blogUrl);
        return {
            title,
            description,
            pubDate: publishDate ? parseDate(publishDate) : undefined,
            link: blogUrl,
        };
    };
    const limit = getRouteLimit(ctx, 30);
    const blogs = (await getBlogs()).slice(0, limit);
    const list = await pMap(blogs, (element) => getBlogInfomation(element), { concurrency: 3 });
    return {
        title: `${lang === 'zh' ? '博客' : 'Blogs'} | ${title}`,
        link: `${link}${lang}/blogs`,
        item: list,
    };
}
