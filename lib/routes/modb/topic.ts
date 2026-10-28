import { load } from 'cheerio';
import { escapeUTF8 } from 'entities/escape';
import pMap from 'p-map';

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

class ArticleBodyUnavailableError extends Error {}

const getArticleDescription = (link: string) =>
    cache.tryGet(`modb:topic:article-body:v1:${link}`, async () => {
        const response = await ofetch(link);
        const $ = load(response);
        const article = $('div.editor-content-styl.article-style').first();
        article.find('script, style').remove();
        if (!article.text().trim() && !article.find('img, video, audio, iframe, table').length) {
            throw new ArticleBodyUnavailableError(`The MODB article does not expose a public body: ${link}`);
        }
        return { description: article.html()! };
    });

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
    const list: Array<DataItem & { link: string }> = response.list.flatMap((item): Array<DataItem & { link: string }> => {
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

    const items = await pMap(
        list,
        async (item) => {
            if (item.description !== undefined) {
                return item;
            }
            try {
                const details = await getArticleDescription(item.link);
                return { ...item, ...details };
            } catch (error) {
                if (error instanceof ArticleBodyUnavailableError) {
                    return item;
                }
                throw error;
            }
        },
        { concurrency: 3 }
    );

    return {
        title: '墨天轮合辑',
        link: `${baseUrl}/topic/${topicId}`,
        item: items,
    };
}
