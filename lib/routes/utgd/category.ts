// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
const md = require('markdown-it')({
    html: true,
});

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'method';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const rootUrl = 'https://utgd.net';
    const apiUrl = `${rootUrl}/api/v2/pages/`;
    const currentUrl = `${rootUrl}/category/s/${category}`;
    const slugUrl = `${rootUrl}/api/v2/category/slug/${category}/`;

    let response = await got({
        method: 'get',
        url: slugUrl,
    });

    const data = response.data;

    response = await got({
        method: 'get',
        url: apiUrl,
        searchParams: {
            type: 'article.Article',
            fields: `article_category(category_name),article_tag(tag_name),title,article_image,article_author,article_description,article_published_time`,
            article_category: data.id,
            order: '-article_published_time',
            limit,
        },
    });

    const items = await Promise.all(
        response.data.items.map((item) =>
            cache.tryGet(`untag-${item.id}`, async () => {
                const authorResponse = await got({
                    method: 'get',
                    url: `${rootUrl}/api/v2/user/profile/${item.article_author.id}/`,
                });

                return {
                    title: item.title,
                    link: `${rootUrl}/article/${item.id}`,
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        membership: item.article_for_membership,
                        image: item.article_image,
                        description: md.render(item.article_description),
                    }),
                    author: authorResponse.data.display_name,
                    pubDate: timezone(parseDate(item.article_published_time), +8),
                    category: [...item.article_category.map((c) => c.category_name), ...item.article_tag.map((t) => t.tag_name)],
                };
            })
        )
    );

    ctx.set('data', {
        title: `UNTAG - ${data.category_name}`,
        link: currentUrl,
        item: items,
        image: data.category_image,
        description: data.category_description,
    });
};
