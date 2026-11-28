import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

const rootUrl = 'https://www.lmsys.org';
const blogUrl = `${rootUrl}/blog/`;

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/lmsys/blog',
    radar: [
        {
            source: ['lmsys.org/blog', 'www.lmsys.org/blog'],
            target: '/blog',
        },
    ],
    name: 'Blog',
    description: 'Full articles on open-source AI infrastructure, model serving, and inference optimization.',
    zh: {
        name: '博客',
        description: '开源 AI 基础设施、模型服务和推理优化博客全文。',
    },
    maintainers: ['ljh12138164'],
    handler,
    url: 'lmsys.org/blog',
};

function getPostLink(value: string) {
    const url = URL.parse(value);
    if (url?.origin === rootUrl && /^\/blog\/[^/]+\/?$/.test(url.pathname)) {
        return `${rootUrl}${url.pathname.replace(/\/?$/, '/')}`;
    }
}

function getPost(link: string) {
    return cache.tryGet(link, async () => {
        const response = await ofetch.raw(link, { responseType: 'text', publicOnly: true });
        const $ = load(response._data ?? '');
        const article = $('article').first();
        article.find('[data-blog-toc]').remove();
        const title = $('h1').first().text();
        const description = article.children('.post-prose').html() ?? article.html();
        if (!title || !description) {
            throw new Error(`LMSYS blog post is missing its title or body: ${link}`);
        }

        return {
            title,
            description,
            link: response.url,
            guid: link,
            author: $('.post-author, [class$="__byline"] > strong').first().text() || undefined,
            image: $('meta[property="og:image"]').attr('content'),
            enclosure_type: $('meta[property="og:image:type"]').attr('content'),
            publishedAt: $('meta[property="article:published_time"]').attr('content'),
        };
    });
}

async function handler(ctx: Context) {
    const sitemap = await ofetch(`${rootUrl}/sitemap.xml`, { responseType: 'text' });
    const $ = load(sitemap, { xml: true });
    const dates = new Map<string, string>();
    for (const entry of $('urlset > url')) {
        const link = getPostLink($(entry).children('loc').text());
        if (link) {
            dates.set(link, $(entry).children('lastmod').text());
        }
    }

    const posts = [...dates].toSorted((a, b) => b[1].localeCompare(a[1])).slice(0, getRouteLimit(ctx, 20));
    const item = await pMap(
        posts,
        async ([link, lastModified]) => {
            const { publishedAt, ...post } = await getPost(link);
            return { ...post, pubDate: parseDate(publishedAt ?? '') ?? parseDate(lastModified) };
        },
        { concurrency: 4 }
    );

    return {
        title: 'LMSYS Org Blog',
        link: blogUrl,
        item,
    };
}
