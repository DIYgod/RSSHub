import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '中文播客榜',
    url: 'xyzrank.com',
    description: `:::tip
可以通过指定 \`limit\` 参数确定榜单排名下限，默认为 250。

若只查看榜单前 50，可在订阅 URL 后加入 \`?limit=50\`。

即，以 [热门节目](https://xyzrank.com/#/) 为例，路由为[\`/xyzrank?limit=50\`](https://rsshub.app/xyzrank?limit=50)。
:::`,
    lang: 'zh-CN',
};
