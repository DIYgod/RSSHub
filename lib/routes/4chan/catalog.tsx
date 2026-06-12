import type { Context } from 'hono';

import type { Route } from '@/types';
import got from '@/utils/got';

import type { CatalogApiReturn } from './utils';
import { parseParams, processCatalog } from './utils';

const handler = async (ctx: Context) => {
    const { board } = ctx.req.param();
    const viewOptions = parseParams(ctx.req.param('routeParams'));
    const { data }: { data: CatalogApiReturn } = await got(`https://a.4cdn.org/${board}/catalog.json`);

    return {
        title: `4chan's /${board}/`,
        link: `https://boards.4chan.org/${board}/catalog`,
        item: processCatalog({ data, board, viewOptions }),
    };
};

export const route: Route = {
    path: '/:board/catalog/:routeParams?',
    categories: ['bbs'],
    example: '/4chan/g/catalog',
    parameters: {
        board: '4chan board',
        routeParams: 'extra parameters, see the table above',
    },
    features: {
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: "Board's catalog",
    maintainers: ['heisenshark'],
    radar: [
        {
            source: ['boards.4chan.org/:board/'],
            target: '/:board/catalog',
        },
    ],
    description: `Specify options (in the format of query string) in parameter \`routeParams\` to control extra features for threads

| Key               | Description                                      | Accepts                | Defaults to |
| ----------------- | ------------------------------------------------ | ---------------------- | ----------- |
| \`showReplyCount\`  | Show number of replies of each thread in catalog | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`     |
| \`showLastReplies\` | Show last 5 replies of each thread               | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`     |
| \`revealSpoilers\`  | Don't wrap images tagged as spoilers             | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`     |
| \`excludeSticky\`   | Filter out sticky threads                        | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`     |
| \`minReplies\`      | Minimum replies per thread                       | Integer                | None        |
| \`maxReplies\`      | Maximum replies per thread                       | Integer                | None        |`,
    handler,
};
