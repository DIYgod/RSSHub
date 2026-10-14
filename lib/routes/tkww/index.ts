import pMap from 'p-map';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const flattenColumns = (columns) => columns.flatMap((column) => [column, ...flattenColumns(column.children ?? [])]);

type Story = DataItem & { url: string; jsonUrl: string; publishTime?: string; summary?: string; keywords?: string[]; tags?: string[] };

export const route: Route = {
    path: '/:column{.+}?',
    categories: ['traditional-media'],
    example: '/tkww/hong_kong',
    parameters: {
        column: '欄目，默認為 home (首頁)',
    },
    features: {
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新聞',
    maintainers: ['quiniapiezoelectricity'],
    radar: [
        {
            source: ['www.tkww.hk/:column'],
            target: '/:column',
        },
        ...['home', 'top_news', 'video', 'opinion', 'Go-China', 'sports', 'vohk', 'dwPlan', 'spec', 'brand', 'brandAct', 'tag', 'topics', 'info', 'poll'].map((parent) => ({
            source: [`www.tkww.hk/${parent}/*column`],
            target: `/${parent}/:column`,
        })),
    ],
    handler,
    description: `::: tip
欄目可用完整的名稱路徑或網頁路徑。
如 \`https://www.tkww.hk/top_news/hong_kong\` 對應 \`top_news/hong_kong\` 或 \`新聞/香港\`。
唯一的目錄名稱也可以單獨使用，例如 \`hong_kong\`；名稱重複時，請使用完整路徑。
:::`,
};

async function handler(ctx) {
    const column: string = ctx.req.param('column') ?? 'home';

    const columns = await cache.tryGet('https://www.tkww.hk/columns.json', async () => await got('https://www.tkww.hk/columns.json'), config.cache.routeExpire, false);

    let metadata;
    let scope = columns.data.data;
    for (const [index, segment] of column.split('/').entries()) {
        metadata = scope.find((item) => item.name === segment || item.dirname === segment);
        if (!metadata && index === 0) {
            const matches = flattenColumns(scope).filter((item) => item.name === segment || item.dirname === segment);
            if (matches.length === 1) {
                metadata = matches[0];
            }
        }
        scope = metadata?.children ?? [];
    }

    if (metadata === undefined) {
        throw new InvalidParameterError(`Invalid Column: ${column}`);
    }

    const stories = await got(`https://www.tkww.hk/columns/${metadata.uuid}/tkww/app/stories.json`);

    const storyList: Story[] = stories.data.data.stories;
    const items = await pMap(
        storyList,
        async (item) => {
            const article = await cache.tryGet(`tkww:article:${item.url}`, async () => {
                const response = await got(item.jsonUrl);
                return { description: response.data.data.content };
            });
            return {
                ...item,
                link: item.url,
                pubDate: item.publishTime,
                category: [...new Set([...(item.keywords ?? []), ...(item.tags ?? [])])],
                ...article,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: metadata.seoTitle,
        description: metadata.seoDescription,
        link: metadata.url,
        item: items,
    };
}
