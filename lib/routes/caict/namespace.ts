import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '中国信息通信研究院',
    url: 'www.caict.ac.cn',
    categories: ['government'],
    description: `::: tip
官方站点存在 WAF，HTTPS 请求常返回 412。本路由使用 \`http://www.caict.ac.cn\` 抓取，并在遇到拦截时自动重试。
:::`,
    lang: 'zh-CN',
};
