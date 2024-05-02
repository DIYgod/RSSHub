import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
});

export const route: Route = {
    path: '/category/:category?',
    categories: ['new-media'],
    example: '/utgd/category/method',
    parameters: { category: '分类，可在对应分类页的 URL 中找到，默认为方法' },
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
            source: ['utgd.net/category/s/:category', 'utgd.net/'],
            target: '/category/:category',
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    description: `| 方法   | 观点    |
  | ------ | ------- |
  | method | opinion |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'method';
    const pagesize = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const rootUrl = 'https://utgd.net';
    const baseApiUrl = 'https://api.utgd.net'
    const apiUrl = `${baseApiUrl}/api/v2/categories`;
    const currentUrl = `${rootUrl}/category/s/${category}`;
    const slugUrl = `${rootUrl}/api/v2/category/slug/${category}/`;

    let response = await got({
        method: 'get',
        url: slugUrl,
    });

    const data = response.data;

    response = await got({
        method: 'get',
        url: `${apiUrl}/${data.id}/related_articles/`,
        searchParams: {
            page: '1',
            pagesize,
        },
    });

    const results = await Promise.all(
        response.data.results.map((result) =>
            cache.tryGet(`untag-${result.id}`, async () => {
                const authorResponse = await got({
                    method: 'get',
                    url: `${rootUrl}/api/v2/user/profile/${result.article_author_id}/`,
                });

                return {
                    title: result.title,
                    link: `${rootUrl}/article/${result.id}`,
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        membership: result.article_for_membership,
                        image: result.article_image,
                        description: md.render(result.article_description),
                    }),
                    author: authorResponse.data.display_name,
                    pubDate: timezone(parseDate(result.article_published_time), +8),
                    category: [...result.article_category.map((c) => c.category_name), ...result.article_tag.map((t) => t.tag_name)],
                };
            })
        )
    );

    return {
        title: `UNTAG - ${data.category_name}`,
        link: currentUrl,
        item: results,
        image: data.category_image,
        description: data.category_description,
    };
}
