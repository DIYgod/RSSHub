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
    const topic = ctx.req.param('topic') ?? '在线阅读专栏';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    const rootUrl = 'https://utgd.net';
    const currentUrl = `${rootUrl}/topic`;
    const topicUrl = `${rootUrl}/api/v2/topic/`;

    let response = await got({
        method: 'get',
        url: topicUrl,
    });

    const topicItems = response.data.filter((i) => i.title === topic);

    if (!topicItems) {
        throw new Error(`No topic named ${topic}`);
    }

    const topicItem = topicItems[0];

    const apiUrl = `${rootUrl}/api/v2/topic/${topicItem.id}/article/`;

    response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = await Promise.all(
        response.data.slice(0, limit).map((item) =>
            cache.tryGet(`untag-${item.id}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${rootUrl}/api/v2/article/${item.id}/`,
                    searchParams: {
                        fields: 'article_description',
                    },
                });

                return {
                    title: item.title,
                    link: `${rootUrl}/article/${item.id}`,
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        membership: item.article_for_membership,
                        image: item.article_image,
                        description: md.render(detailResponse.data.article_description),
                    }),
                    author: item.article_author_displayname,
                    pubDate: timezone(parseDate(item.article_published_time), +8),
                    category: [...item.article_category.map((c) => c.name), ...item.article_tag.map((t) => t.name)],
                };
            })
        )
    );

    ctx.set('data', {
        title: `UNTAG - ${topicItem.title}`,
        link: currentUrl,
        item: items,
        description: topicItem.summary,
    });
};
