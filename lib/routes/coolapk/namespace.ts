import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '酷安',
    url: 'coolapk.com',
    description: `
::: tip
即日起，多数路由图片防盗链。
需要将 \`ALLOW_USER_HOTLINK_TEMPLATE\` 环境变量设置为 \`true\` ，然后配置\`image_hotlink_template\` 。
详见 [#16715](https://github.com/DIYgod/RSSHub/issues/16715)
:::`,
    lang: 'zh-CN',
};
