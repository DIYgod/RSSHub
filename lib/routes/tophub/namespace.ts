import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '今日热榜',
    url: 'tophub.today',
    description: `::: warning
无需 Cookie 即可获取榜单，未配置时使用今日热榜跳转链接。若需获取原始链接，可在自建实例中配置 \`TOPHUB_COOKIE\`，详情见部署页面的配置模块。
:::`,
    lang: 'zh-CN',
};
