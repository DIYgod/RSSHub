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
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const rootUrl = 'https://utgd.net';
    const apiUrl = `${rootUrl}/api/v2/timeline/?page=1&page_size=${limit}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await Promise.all(
        response.data.results.slice(0, limit).map((item) =>
            cache.tryGet(`untag-${item.id}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${rootUrl}/api/v2/article/${item.id}/`,
                    searchParams: {
                        fields: 'article_description,article_category(category_name),article_tag(tag_name)',
                    },
                });

                const data = detailResponse.data;

                return {
                    title: item.title,
                    link: `${rootUrl}/article/${item.id}`,
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        membership: data.article_for_membership,
                        image: item.article_image,
                        description: md.render(data.article_description),
                    }),
                    author: item.article_author_displayname,
                    pubDate: timezone(parseDate(item.article_published_time), +8),
                    category: [...data.article_category.map((c) => c.category_name), ...data.article_tag.map((t) => t.tag_name)],
                };
            })
        )
    );

    ctx.set('data', {
        title: 'UNTAG',
        link: rootUrl,
        item: items,
    });
};
