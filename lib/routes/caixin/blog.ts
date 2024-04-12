import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { isValidHost } from '@/utils/valid-host';
import { parseDate } from '@/utils/parse-date';
import { parseBlogArticle } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/blog/:column?',
    categories: ['blog'],
    example: '/caixin/blog/zhangwuchang',
    parameters: { column: '博客名称，可在博客主页的 URL 找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '用户博客',
    maintainers: [],
    handler,
    description: `通过提取文章全文，以提供比官方源更佳的阅读体验.`,
};

async function handler(ctx) {
    const column = ctx.req.param('column');
    const { limit = 20 } = ctx.req.query();
    if (column) {
        if (!isValidHost(column)) {
            throw new InvalidParameterError('Invalid column');
        }
        const link = `https://${column}.blog.caixin.com`;
        const { data: response } = await got(link);
        const $ = load(response);
        const user = $('div.indexMainConri > script[type="text/javascript"]')
            .text()
            .substring('window.user = '.length + 1)
            .split(';')[0]
            .replaceAll(/\s/g, '');
        const authorId = user.match(/id:"(\d+)"/)[1];
        const authorName = user.match(/name:"(.*?)"/)[1];
        const avatar = user.match(/avatar:"(.*?)"/)[1];
        const introduce = user.match(/introduce:"(.*?)"/)[1];

        const {
            data: { data },
        } = await got('https://blog.caixin.com/blog-api/post/posts', {
            searchParams: {
                page: 1,
                size: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20,
                content: '',
                authorId,
                sort: 'publishTime',
                direction: 'DESC',
            },
        });

        const posts = data.map((item) => ({
            title: item.title,
            description: item.brief,
            author: item.displayName,
            link: item.guid.replace('http://', 'https://'),
            pubDate: parseDate(item.publishTime, 'x'),
        }));

        const items = await Promise.all(posts.map((item) => parseBlogArticle(item, cache.tryGet)));

        return {
            title: `财新博客 - ${authorName}`,
            link,
            description: introduce,
            image: avatar,
            item: items,
        };
    } else {
        const { data } = await got('https://blog.caixin.com/blog-api/post/index', {
            searchParams: {
                page: 1,
                size: limit,
            },
        });
        const posts = data.data.map((item) => ({
            title: item.title,
            description: item.brief,
            author: item.authorName,
            link: item.postUrl.replace('http://', 'https://'),
            pubDate: parseDate(item.publishTime, 'x'),
        }));
        const items = await Promise.all(posts.map((item) => parseBlogArticle(item, cache.tryGet)));

        return {
            title: `财新博客 - 全部`,
            link: 'https://blog.caixin.com',
            // description: introduce,
            // image: avatar,
            item: items,
        };
    }
}
