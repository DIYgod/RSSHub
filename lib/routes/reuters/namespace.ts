import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'Reuters',
    url: 'reuters.com',
    description: `::: tip
You can use \`sophi=true\` query parameter to invoke the **experimental** method, which can, if possible, fetch more articles(between 20 and 100) with \`limit\` given. But some articles from the old method might not be available.
:::`,
    lang: 'en',
};
