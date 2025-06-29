import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '禁漫天堂',
    url: '18comic.org',
    description: `::: tip
禁漫天堂有多个备用域名，本路由默认使用域名 \`https://jmcomic.me\`，若该域名无法访问，可以通过在路由最后加上 \`?domain=<域名>\` 指定路由访问的域名。如指定备用域名为 \`https://jmcomic1.me\`，则在所有禁漫天堂路由最后加上 \`?domain=jmcomic1.me\` 即可，此时路由为 [\`/18comic?domain=jmcomic1.me\`](https://rsshub.app/18comic?domain=jmcomic1.me)
由于网页版有防爬虫机制，建议使用 API 模式获取数据，API 模式可以通过在路由最后加上 \`?api=true\` 开启。目前仅支持搜索路由开启 API 模式，其他路由暂不支持。
:::`,
    lang: 'zh-CN',
};
