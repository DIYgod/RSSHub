import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'Mistral AI',
    url: 'mistral.ai',
    description: 'The official Mistral news RSS (`https://mistral.ai/news/rss`) only contains short summaries. Routes here fetch the full article text.',
    lang: 'en',

    zh: {
        name: 'Mistral AI',
        description: 'Mistral 官方新闻 RSS（`https://mistral.ai/news/rss`）只包含简短摘要，此处的路由会抓取文章全文。',
    },
};
