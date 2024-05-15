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
import InvalidParameterError from '@/errors/types/invalid-parameter';
const md = MarkdownIt({
    html: true,
});

export const route: Route = {
    path: '/topic/:topic?',
    categories: ['new-media'],
    example: '/utgd/topic/在线阅读专栏',
    parameters: { topic: '专题，默认为在线阅读专栏' },
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
            source: ['utgd.net/topic', 'utgd.net/'],
            target: '/topic/:topic',
        },
    ],
    name: '专题',
    maintainers: ['nczitzk'],
    handler,
    url: 'utgd.net/topic',
    description: `| 在线阅读专栏 | 卡片笔记专题 |
  | ------------ | ------------ |

  更多专栏请见 [专题广场](https://utgd.net/topic)`,
};

async function handler(ctx) {
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
        throw new InvalidParameterError(`No topic named ${topic}`);
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

    return {
        title: `UNTAG - ${topicItem.title}`,
        link: currentUrl,
        item: items,
        description: topicItem.summary,
    };
}
