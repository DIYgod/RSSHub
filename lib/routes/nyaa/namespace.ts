import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'Nyaa',
    url: 'nyaa.si',
    description: `
::: tip
The 'Nyaa' includes several routes to access different parts of the site:
1. \`/nyaa/search/:query?\` - Use this route to search for content with a specific query. For example, \`/nyaa/search/bocchi\` to search for bocchi related content.
2. \`/nyaa/user/:username?\` - Access a user's profile by their username, e.g., \`/nyaa/user/ANiTorrent\`.
3. \`/nyaa/user/:username/search/:query?\` - Search within a specific user's submissions using a query, e.g., \`/nyaa/user/ANiTorrent/search/bocchi\`.
4. \`/nyaa/sukebei/search/:query?\` - This route is for searching adult content with a specific query, e.g., \`/nyaa/sukebei/search/hentai\`.
5. \`/nyaa/sukebei/user/:username?\` - Access an adult content user's profile, e.g., \`/nyaa/sukebei/user/milannews\`.
6. \`/nyaa/sukebei/user/:username/search/:query?\` - Search within a specific user's adult content submissions, e.g., \`/nyaa/sukebei/user/milannews/search/hentai\`.
:::`,
    lang: 'en',
};
