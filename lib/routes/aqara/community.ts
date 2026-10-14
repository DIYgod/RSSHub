import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';

type CommunityTopic = { id: number; title: string; slug: string; tags?: string[] };
type CommunitySearchPost = { id: number; topic_id: number };

export const route: Route = {
    path: '/community/:id?/:keyword?',
    categories: ['other'],
    example: '/aqara/community',
    parameters: { id: '分类 id，可在对应分类页 URL 中找到，默认为全部', keyword: '关键字，默认为空' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '社区',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '';
    const keyword = ctx.req.param('keyword') ?? '';
    const limit = getRouteLimit(ctx, 100);

    const rootUrl = 'https://community.ankasa.cn';
    let currentUrl = id ? `${rootUrl}/c/${id}` : `${rootUrl}/latest`;
    let items;

    if (keyword) {
        const query = `${keyword} in:first order:latest${id ? ` category:${id}` : ''}`;
        currentUrl = `${rootUrl}/search?q=${encodeURIComponent(query)}`;
        const { data } = await got(`${rootUrl}/search.json`, { searchParams: { q: query } });
        const topicList = data.topics as CommunityTopic[];
        const posts = data.posts as CommunitySearchPost[];
        const topics = new Map(topicList.map((topic) => [topic.id, topic]));
        items = await pMap(
            posts.slice(0, limit),
            (post) =>
                cache.tryGet(`${rootUrl}/posts/${post.id}.json`, async () => {
                    const { data: detail } = await got(`${rootUrl}/posts/${post.id}.json`);
                    const topic = topics.get(post.topic_id);
                    if (!topic) {
                        throw new Error(`Aqara community search result is missing topic ${post.topic_id}.`);
                    }
                    return {
                        title: topic.title,
                        link: `${rootUrl}/t/${topic.slug}/${post.topic_id}`,
                        description: detail.cooked,
                        pubDate: parseDate(detail.created_at),
                        author: detail.name || detail.username,
                        category: topic.tags,
                    };
                }),
            { concurrency: 3 }
        );
    } else {
        const feedUrl = id ? `${rootUrl}/c/${id}.rss` : 'https://community.aqara.com/latest.rss';
        const { data } = await got(feedUrl);
        const feed = await parser.parseString(data);
        items = feed.items.slice(0, limit).map((item) => ({
            title: item.title ?? '',
            link: item.link,
            description: item.content,
            pubDate: item.isoDate ? parseDate(item.isoDate) : undefined,
            author: item.creator,
            guid: item.guid,
        }));
    }

    return {
        title: 'Aqara社区',
        link: currentUrl,
        item: items,
    };
}
