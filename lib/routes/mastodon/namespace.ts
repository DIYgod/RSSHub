import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'Mastodon',
    url: 'mastodon.social',
    description: `:::tip
Official user RSS:

-   RSS: \`https://**:instance**/users/**:username**.rss\` ([Example](https://pawoo.net/users/pawoo_support.rss))
-   Atom: ~~\`https://**:instance**/users/**:username**.atom\`~~ (Only for pawoo.net, [example](https://pawoo.net/users/pawoo_support.atom))

These feed do not include boosts (a.k.a. reblogs). RSSHub provides a feed for user timeline based on the Mastodon API, but to use that, you may need to create application on a Mastodon instance, and configure your RSSHub instance. Check the [Deploy Guide](https://docs.rsshub.app/deploy/config#route-specific-configurations) for route-specific configurations.
:::`,
};
