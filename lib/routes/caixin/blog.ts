// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { isValidHost } from '@/utils/valid-host';
import { parseDate } from '@/utils/parse-date';
const { parseBlogArticle } = require('./utils');

export default async (ctx) => {
    const column = ctx.req.param('column');
    const { limit = 20 } = ctx.req.query();
    if (column) {
        if (!isValidHost(column)) {
            throw new Error('Invalid column');
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

        ctx.set('data', {
            title: `财新博客 - ${authorName}`,
            link,
            description: introduce,
            image: avatar,
            item: items,
        });
    } else {
        const { data } = await got('https://blog.caixin.com/blog-api/post/index', {
            searchParams: {
                page: 1,
                size: limit,
            },
        }).json();
        const posts = data.map((item) => ({
            title: item.title,
            description: item.brief,
            author: item.authorName,
            link: item.postUrl.replace('http://', 'https://'),
            pubDate: parseDate(item.publishTime, 'x'),
        }));
        const items = await Promise.all(posts.map((item) => parseBlogArticle(item, cache.tryGet)));

        ctx.set('data', {
            title: `财新博客 - 全部`,
            link: 'https://blog.caixin.com',
            // description: introduce,
            // image: avatar,
            item: items,
        });
    }
};
