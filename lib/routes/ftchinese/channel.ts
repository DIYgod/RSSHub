import type { Route } from '@/types';

import utils from './utils';

export const route: Route = {
    path: '/:language/:channel?',
    categories: ['traditional-media'],
    example: '/ftchinese/simplified/hotstoryby7day',
    parameters: { language: '语言，简体 `simplified`，繁体 `traditional`', channel: '频道，缺省为每日更新' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'FT 中文网',
    maintainers: ['HenryQW', 'xyqfer'],
    handler,
    description: `::: tip
  -   不支持付费文章。
:::

  通过提取文章全文，以提供比官方源更佳的阅读体验。

  支持所有频道，频道名称见 [官方频道 RSS](http://www.ftchinese.com/channel/rss.html).

  -   频道为单一路径，如 \`http://www.ftchinese.com/rss/news\` 则为 \`/ftchinese/simplified/news\`.
  -   频道包含多重路径，如 \`http://www.ftchinese.com/rss/column/007000002\` 则替换 \`/\` 为 \`-\` \`/ftchinese/simplified/column-007000002\`.`,
};

async function handler(ctx) {
    return await utils.getData({
        site: ctx.req.param('language') === 'simplified' ? 'www' : 'big5',
        channel: ctx.req.param('channel'),
        ctx,
    });
}
