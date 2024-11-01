import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'JavDB',
    url: 'javdb.com',
    description: `:::tip
JavDB 有多个备用域名，本路由默认使用永久域名 \`https://javdb.com\` ，若该域名无法访问，可以通过在路由最后加上 \`?domain=<域名>\` 指定路由访问的域名。如指定备用域名为 \`https://javdb36.com\`，则在所有 JavDB 路由最后加上 \`?domain=javdb36.com\` 即可，此时路由为 [\`/javdb?domain=javdb36.com\`](https://rsshub.app/javdb?domain=javdb36.com)

如果加入了 **分類** 参数，直接在分類参数后加入 \`?domain=<域名>\` 即可。如指定分類 URL 为 \`https://javdb.com/tags?c2=5&c10=1\` 并指定备用域名为 \`https://javdb36.com\`，即在 \`/javdb/tags/c2=5&c10=1\` 最后加上 \`?domain=javdb36.com\`，此时路由为 [\`/javdb/tags/c2=5&c10=1?domain=javdb36.com\`](https://rsshub.app/javdb/tags/c2=5\&c10=1?domain=javdb36.com)

**排行榜**、**搜索**、**演員**、**片商** 参数同适用于 **分類** 参数的上述规则
:::

:::tip
你可以通过指定 \`limit\` 参数来获取特定数量的条目，即可以通过在路由后方加上 \`?limit=25\`，默认为单次获取 20 个条目，即默认 \`?limit=20\`

因为该站有反爬检测，所以不应将此值调整过高
:::`,
    lang: 'zh-CN',
};
