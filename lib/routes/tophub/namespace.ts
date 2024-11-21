import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '今日热榜',
    url: 'tophub.today',
    description: `:::warning
由于需要登录后的 Cookie 值才能获取原始链接，所以需要自建，需要在环境变量中配置 \`TOPHUB_COOKIE\`，详情见部署页面的配置模块。
:::`,
    lang: 'zh-CN',
};
