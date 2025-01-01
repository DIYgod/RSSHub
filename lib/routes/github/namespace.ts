import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'GitHub',
    url: 'github.com',
    description: `::: tip
GitHub provides some official RSS feeds:

-   Repo releases: \`https://github.com/:owner/:repo/releases.atom\`
-   Repo commits: \`https://github.com/:owner/:repo/commits.atom\`
-   User activities: \`https://github.com/:user.atom\`
-   Private feed: \`https://github.com/:user.private.atom?token=:secret\` (You can find **Subscribe to your news feed** in [dashboard](https://github.com) page after login)
-   Wiki history: \`https://github.com/:owner/:repo/wiki.atom\`
:::`,
    lang: 'en',
};
