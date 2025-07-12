import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'GitHub',
    url: 'github.com',
    description: `::: tip
GitHub provides some official RSS feeds:

-   Repo releases: \`https://github.com/:owner/:repo/releases.atom\`
-   Repo commits: \`https://github.com/:owner/:repo/commits.atom\`
-   User activities: \`https://github.com/:user.atom\`
-   Private feed: \`https://github.com/:user.private.atom?token=:secret\` (Note: You can ONLY obtain this url via an [API](https://docs.github.com/en/rest/activity/feeds?apiVersion=2022-11-28) call with a [Personal Access Token](https://github.com/settings/tokens/new) with **ENOUGH** scopes now.)
-   Wiki history: \`https://github.com/:owner/:repo/wiki.atom\`
:::`,
    lang: 'en',
};
