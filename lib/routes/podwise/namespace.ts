import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'Podwise',
    url: 'podwise.ai',
    description: `
:::tip
Podwise provides  none of official RSS feeds.
This route support below:

-   Collections: \`https://podwise.ai/explore\`
-   Episodes: \`https://podwise.ai/explore/:category\`
-   Episode: \`https://podwise.ai/dashboard/episodes/:episode\`
:::`,

    zh: {
        name: 'Podwise',
    },
};
