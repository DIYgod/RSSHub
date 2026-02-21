import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'The Initium',
    url: 'theinitium.com',
    description: `:::tip
Set the environment variable \`INITIUM_MEMBER_COOKIE\` to get the full text of paid articles. After logging in to theinitium.com, copy the Cookie from the browser developer tools.

Old environment variables \`INITIUM_USERNAME\`, \`INITIUM_PASSWORD\`, and \`INITIUM_BEARER_TOKEN\` are no longer used since the site migrated to Ghost CMS.
:::`,

    zh: {
        name: '端傳媒',
        description: `:::tip
设置环境变量 \`INITIUM_MEMBER_COOKIE\` 可获取付费文章全文。登录 theinitium.com 后，从浏览器开发者工具中复制 Cookie。

旧的环境变量 \`INITIUM_USERNAME\`、\`INITIUM_PASSWORD\` 和 \`INITIUM_BEARER_TOKEN\` 已不再使用（网站已迁移至 Ghost CMS）。
:::`,
    },
};
