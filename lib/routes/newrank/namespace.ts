import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '新榜',
    url: 'newrank.cn',
    description: `:::warning
部署时需要配置 NEWRANK\_COOKIE，具体见部署文档
请勿过高频抓取，新榜疑似对每天调用 token 总次数进行了限制，超限会报错
:::`,
};
