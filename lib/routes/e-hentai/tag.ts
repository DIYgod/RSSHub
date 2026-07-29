import type { Route } from '@/types';

import { handler } from './index';

export const route: Route = {
    path: '/tag/:tag?/:needTorrents?/:needImages?',
    categories: ['multimedia'],
    example: '/e-hentai/tag/language:chinese',
    parameters: {
        tag: '标签，可在对应标签页中找到，默认为首页',
        needTorrents: '需要输出种子文件，填写 true/yes 表示需要，默认需要',
        needImages: '需要显示大图，填写 true/yes 表示需要，默认需要',
    },
    features: {
        nsfw: true,
    },
    radar: [
        {
            source: ['e-hentai.org/tag/:tag', 'e-hentai.org/'],
            target: '/tag/:tag',
        },
    ],
    name: '标签',
    maintainers: ['nczitzk'],
    description: `::: tip
参数 **需要输出种子文件**、**需要显示大图** 的说明同上，以下是一个例子：

选择浏览 [language:chinese 标签](https://e-hentai.org/tag/language:chinese)，并指定 **携带种子文件**，**不显示大图**。由于 [language:chinese 标签](https://e-hentai.org/tag/language:chinese) 的 URL \`https://e-hentai.org/tag/language:chinese\` 中对应标签字段为 \`language:chinese\`，所以对应路由为 [\`/e-hentai/tag/language:chinese/true/false\`](https://rsshub.app/e-hentai/tag/language:chinese/true/false)
:::`,
    handler,
};
