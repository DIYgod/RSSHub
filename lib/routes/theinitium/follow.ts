import type { Route } from '@/types';

export const route: Route = {
    path: '/follow/articles/:language?',
    name: '个人订阅追踪动态（已停用）',
    maintainers: ['AgFlore'],
    parameters: {
        language: '语言',
    },
    radar: [],
    handler: () => {
        throw new Error('此路由已停用。端传媒迁移到 Ghost CMS 后不再支持个人追踪功能。请改用 /theinitium/channel/latest 或 /theinitium/tags/:tag 订阅。');
    },
    example: '/theinitium/follow/articles',
    categories: ['new-media'],
    description: `:::warning
此路由已停用。端传媒已迁移到 Ghost CMS，不再支持通过 API 获取个人追踪内容。请改用标签或栏目订阅。
:::`,
};
