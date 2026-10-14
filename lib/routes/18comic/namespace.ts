import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '禁漫天堂',
    url: 'jmcomic1.me',
    description: `::: tip
禁漫天堂有多个备用域名，本路由默认使用域名 \`https://jmcomic1.me\`。若该域名无法访问，可以通过在路由最后加上 \`?domain=<域名>\` 指定路由访问的域名，域名不包含协议。例如 [\`/18comic?domain=jmcomic1.me\`](https://rsshub.app/18comic?domain=jmcomic1.me) 使用当前默认域名。
:::`,
    lang: 'zh-CN',
};
