import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'Coomer',
    url: 'coomer.st',
    description: `::: tip
The route uses \`https://coomer.st\` and \`https://img.coomer.st\` by default. Self-hosted instances can override them with the \`COOMER_ROOT_URL\` and \`COOMER_ASSETS_URL\` environment variables. If only \`COOMER_ROOT_URL\` is set, the asset URL is inferred by adding the \`img.\` subdomain.
:::`,
    lang: 'en',
};
