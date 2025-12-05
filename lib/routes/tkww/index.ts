import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

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
    ],
    handler,
    description: `
::: tip
欄目可用\`名稱\`或對應網頁的\`path\`，
如 \`https://www.tkww.hk/hong_kong\` 的欄目可以填\`香港\`或是\`hong_kong\`
而 \`https://www.tkww.hk/china/shanghai\` 的欄目則需填\`china/shanghai\`
:::`,
};

async function handler(ctx) {
    const column = ctx.req.param('column') ?? 'home';

    const columns = await cache.tryGet('https://www.tkww.hk/columns.json', async () => await got('https://www.tkww.hk/columns.json'), config.cache.routeExpire, false);

    let metadata;
    let scope = columns.data.data;
    for (const segment of column.split('/').filter((item) => typeof item === 'string')) {
        metadata = scope.find((item) => item.name === segment || item.dirname === segment);
        scope = metadata?.children ?? [];
    }

    if (metadata === undefined) {
        throw new InvalidParameterError(`Invalid Column: ${column}`);
    }

    const stories = await got(`https://www.tkww.hk/columns/${metadata.uuid}/tkww/app/stories.json`);

    const items = await Promise.all(
        stories.data.data.stories.map((item) =>
            cache.tryGet(item.url, async () => {
                item.link = item.url;
                item.description = item.summary;
                item.pubDate = item.publishTime;
                item.category = [];
                if (item.keywords) {
                    item.category = [...item.category, ...item.keywords];
                }
                if (item.tags) {
                    item.category = [...item.category, ...item.tags];
                }
                item.category = [...new Set(item.category)];
                const response = await got(item.jsonUrl);
                item.description = response.data.data.content;
                return item;
            })
        )
    );

    return {
        title: metadata.seoTitle,
        description: metadata.seoDescription,
        link: metadata.url,
        item: items,
    };
}
