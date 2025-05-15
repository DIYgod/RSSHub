import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseURL = 'https://www.tokeninsight.com/';
const title = 'TokenInsight';
const link = 'https://www.tokeninsight.com/';

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

    const getBlogInfomation = async (blog) => {
        const { publishDate, title, id } = blog;
        const blogUrl = `${baseURL}${lang}/blogs/${id}`;
        const description = await cache.tryGet(blogUrl, async () => {
            const res = await got(blogUrl);
            const $ = load(res.data);
            const description = $('.detail_html_box').html();
            return description;
        });
        return {
            // 文章标题
            title,
            // 文章正文
            description,
            // 文章发布时间
            pubDate: parseDate(publishDate),
            // 文章链接
            link: blogUrl,
        };
    };
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30;
    const blogs = (await getBlogs()).slice(0, limit);
    const list = await Promise.all(blogs.map((element) => getBlogInfomation(element)));
    return {
        title: `${lang === 'zh' ? '博客' : 'Blogs'} | ${title}`,
        link: `${link}${lang}/blogs`,
        item: list,
    };
}
