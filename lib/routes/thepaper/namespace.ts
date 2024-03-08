import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '澎湃新闻',
    url: 'thepaper.cn',
    description: `以下所有路由可使用参数\`old\`以采取旧全文获取方法。该方法会另外获取网页中的图片与视频资源。在原始 url 追加\`?old=yes\`以启用.`,
};
