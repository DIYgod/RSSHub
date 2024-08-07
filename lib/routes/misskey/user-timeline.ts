import { Route } from '@/types';
import utils from './utils';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/users/notes/:username',
    categories: ['social-media'],
    example: '/misskey/users/notes/@support@misskey.io',
    parameters: { username: 'misskey username format, like @support@misskey.io' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User timeline',
    maintainers: ['siygle'],
    handler,
};

async function handler(ctx) {
    const username = ctx.req.param('username');
    const [, pureusername, site] = username.match(/@(\w+)@(\w+\.\w+)/) || [];
    if (!pureusername || !site) {
        throw new ConfigNotFoundError('Provide a valid Misskey username');
    }
    if (!config.feature.allow_user_supply_unsafe_domain && !utils.allowSiteList.includes(site)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const { account_data } = await utils.getUserTimelineByUsername(pureusername, site);

    return {
        title: `User timeline for ${username} on ${site}`,
        link: `https://${site}/@${pureusername}`,
        item: utils.parseNotes(account_data, site),
    };
}
