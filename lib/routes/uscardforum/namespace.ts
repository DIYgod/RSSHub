import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'uscardforum',
    url: 'uscardforum.com',
    description: `
:::tip
UsCardForum is a Chinese community focused on U.S. credit cards, bank accounts, rebates, deals, and daily life in North America.

It is built with Discourse and supports some official RSS feeds:

-   Latest posts: \`https://www.uscardforum.com/posts.rss\`
-   Category-specific: \`https://www.uscardforum.com/c/credit-cards/1.rss\`
-   Tag-specific: \`https://www.uscardforum.com/tag/amex.rss\`

This namespace provides **enhanced RSS for Top Posts** in any category, supporting filtering by time period (daily/weekly/monthly/yearly).
:::`,
    zh: {
        name: '美卡论坛',
        description: `
:::tip
美卡论坛是一个专注于美国信用卡、银行账户、返现、羊毛信息和北美生活的中文社区。

网站使用 Discourse 构建，并支持一些内置 RSS 源：

-   全站最新帖子：\`https://www.uscardforum.com/posts.rss\`
-   指定分类订阅：\`https://www.uscardforum.com/c/credit-cards/1.rss\`
-   指定标签订阅：\`https://www.uscardforum.com/tag/amex.rss\`

本命名空间扩展了对热门帖子排行的支持，允许按"分类 + 时间范围（日/周/月/年）"订阅。
:::`,
    },
};
