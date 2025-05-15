import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '联合早报',
    url: 'www.zaobao.com',
    description: `::: warning
由于 [RSSHub#10309](https://github.com/DIYgod/RSSHub/issues/10309) 中的问题，使用靠近香港的服务器部署将从 hk 版联合早报爬取内容，造成输出的新闻段落顺序错乱。如有订阅此源的需求，建议寻求部署在远离香港的服务器上的 RSSHub，或者在自建时选择远离香港的服务器。
:::`,
    lang: 'zh-CN',
};
