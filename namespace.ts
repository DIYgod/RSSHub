import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: 'Twitch',
    url: 'twitch.tv',
    description: `
:::tip
Twitch routes require a Client ID and Client Secret.
Register your app at [Twitch Developer Console](https://dev.twitch.tv/console/apps) and set:
- \`TWITCH_CLIENT_ID\`
- \`TWITCH_CLIENT_SECRET\`
:::`,
};
