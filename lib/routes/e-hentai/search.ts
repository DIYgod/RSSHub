import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/search/:keyword?/:needTorrents?/:needImages?',
    categories: ['multimedia'],
    example: '/e-hentai/search/f_search=haha',
    parameters: {
        keyword: '关键字，可以在搜索结果页的 URL 中找到，默认为首页',
        needTorrents: '需要输出种子文件，填写 true/yes 表示需要，默认需要',
        needImages: '需要显示大图，填写 true/yes 表示需要，默认需要',
    },
    features: {
        nsfw: true,
    },
    radar: [
        {
            source: ['e-hentai.org/:keyword', 'e-hentai.org/'],
            target: '/search/:keyword',
        },
    ],
    name: '搜索',
    maintainers: ['nczitzk'],
    description: `::: tip
参数 **需要输出种子文件**、**需要显示大图** 的说明同上，以下是一个例子：

选择浏览 [f\\_search=cosplay 搜索结果](https://e-hentai.org/?f_search=cosplay)，并指定 **携带种子文件**，且 **显示大图**。由于 [f\\_search=cosplay 搜索结果](https://e-hentai.org/?f_search=cosplay) 的 URL \`https://e-hentai.org/?f_search=cosplay\` 中对应关键字字段为 \`?\` 后的 \`f_search=cosplay\`，所以对应路由为 [\`/e-hentai/search/f_search=cosplay/y/y\`](https://rsshub.app/e-hentai/search/f_search=cosplay/y/y)
:::`,
    handler,
};
