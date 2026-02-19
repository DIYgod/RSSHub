import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/topic/:id',
    categories: ['programming'],
    example: '/modb/topic/44158',
    parameters: { id: '合辑序号' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '合辑',
    maintainers: ['yueneiqi'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://www.modb.pro';
    const topicId = ctx.req.param('id');
    const response = await ofetch(`${baseUrl}/api/columns/getKnowledge`, {
        query: {
            pageNum: 1,
            pageSize: 20,
            columnId: topicId,
        },
    });
    const list = response.list.map((item) => {
        let doc = {};
        let baseLink = {};
        switch (item.type) {
            case 0:
                doc = item.knowledge;
                baseLink = `${baseUrl}/db`;
                break;
            case 1:
                doc = item.dbDoc;
                baseLink = `${baseUrl}/doc`;
                break;
            default:
                logger.error(`unknown type ${item.type}`);
        }

        return {
            title: doc.title,
            link: `${baseLink}/${item.rid}`,
            pubDate: timezone(parseDate(item.createdTime), +8),
            author: doc.createdByName,
            category: doc.tags,
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('div.editor-content-styl.article-style').first().html();
                return item;
            })
        )
    );

    return {
        title: '墨天轮合辑',
        link: `${baseUrl}/topic/${topicId}`,
        item: items,
    };
}
