import { load } from 'cheerio';
import { escapeUTF8 } from 'entities/escape';

import type { DataItem, Route } from '@/types';
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

interface TopicDoc {
    title?: DataItem['title'];
    brief?: string;
    imageUrl?: string;
    createdByName?: string;
    tags?: string[];
}

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
    const list = response.list.flatMap((item): Array<DataItem & { link: string }> => {
        const doc: TopicDoc | undefined = item.type === 0 ? item.knowledge : item.type === 1 ? item.dbDoc : undefined;
        if (!doc?.title || item.rid === undefined || item.rid === null) {
            logger.error(`Unsupported or incomplete topic entry of type ${item.type}`);
            return [];
        }
        const baseLink = `${baseUrl}/${item.type === 0 ? 'db' : 'doc'}`;

        return [
            {
                title: doc.title,
                link: `${baseLink}/${item.rid}`,
                pubDate: timezone(parseDate(item.createdTime), 8),
                author: doc.createdByName,
                category: doc.tags,
                description: item.type === 1 ? `${doc.imageUrl ? `<img src="${escapeUTF8(doc.imageUrl)}">` : ''}${doc.brief ? `<p>${escapeUTF8(doc.brief).replaceAll('\n', '<br>')}</p>` : ''}` : undefined,
            },
        ];
    });

    const items = await Promise.all(
        list.map((item) =>
            item.description === undefined
                ? cache.tryGet(item.link, async () => {
                      const response = await ofetch(item.link);
                      const $ = load(response);
                      item.description = $('div.editor-content-styl.article-style').first().html();
                      return item;
                  })
                : item
        )
    );

    return {
        title: '墨天轮合辑',
        link: `${baseUrl}/topic/${topicId}`,
        item: items,
    };
}
