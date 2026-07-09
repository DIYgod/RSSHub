import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '中国信息通信研究院',
    url: 'www.caict.ac.cn',
    categories: ['government'],
    description: `::: tip
官方站点存在 WAF，部分环境访问 \`https://\` 可能返回 412。本路由使用 \`http://www.caict.ac.cn\` 抓取。
:::`,
    lang: 'zh-CN',
};
