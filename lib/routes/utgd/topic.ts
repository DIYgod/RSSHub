import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { apiRootUrl, parseArticle, parseResult, rootUrl } from './utils';

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
            target: '/topic',
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
    const limit = getRouteLimit(ctx, 20);

    const currentUrl = `${rootUrl}/topic`;
    const topicUrl = `${apiRootUrl}/api/v2/topic/`;

    let response = await ofetch(topicUrl);

    const topicItem = response.find((i) => i.title === topic);

    if (!topicItem) {
        throw new InvalidParameterError(`No topic named ${topic}`);
    }

    const apiUrl = `${rootUrl}/api/v2/topic/${topicItem.id}/article/`;

    response = await ofetch(apiUrl);

    const list = parseResult(response.results, limit);

    const items = await pMap(list, parseArticle, { concurrency: 3 });

    return {
        title: `UNTAG - ${topicItem.title}`,
        link: currentUrl,
        item: items,
        description: topicItem.summary,
    };
}
