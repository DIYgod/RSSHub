import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'Truth Social',
    url: 'truthsocial.com',
    description: `Truth Social is a Mastodon-based social network. Public posts of prominent accounts (e.g. \`realDonaldTrump\`) are readable without authentication.

::: warning
Truth Social sits behind Cloudflare and aggressively blocks data-center IPs. Self-hosted instances on cloud servers may receive \`403\`. Running from a residential IP or via a proxy is recommended.
:::`,
    lang: 'en',
};
