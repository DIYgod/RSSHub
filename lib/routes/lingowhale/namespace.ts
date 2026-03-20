import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '语鲸',
    url: 'lingowhale.com',
    description: `::: warning
这是一个私有部署路由，推荐配置单环境变量 \`LINGOWHALE_SESSION\`，内容为 JSON，例如：

\`\`\`json
{"uid":"...","bId":"...","authToken":"...","accessToken":"..."}
\`\`\`

也兼容分别配置 \`LINGOWHALE_ACCESS_TOKEN\`、\`LINGOWHALE_AUTH_TOKEN\` 和 \`LINGOWHALE_B_ID\`。

路由会在运行时通过语鲸 passport 服务自动刷新 token；如果实例长时间停机，或初始 \`auth token\` 已失效，则需要重新从语鲸 Web 端存储中取一次种子值。
:::`,
    lang: 'zh-CN',
};
