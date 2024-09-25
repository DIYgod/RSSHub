import { Route, ViewType } from '@/types';
import utils from './utils';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/users/notes/:username',
    categories: ['social-media', 'popular'],
    view: ViewType.SocialMedia,
    example: '/misskey/users/notes/support@misskey.io',
    parameters: { username: 'misskey username format, like support@misskey.io' },
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
    const [, pureUsername, site] = username.match(/@?(\w+)@(\w+\.\w+)/) || [];
    if (!pureUsername || !site) {
        throw new InvalidParameterError('Provide a valid Misskey username');
    }
    if (!config.feature.allow_user_supply_unsafe_domain && !utils.allowSiteList.includes(site)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const { accountData } = await utils.getUserTimelineByUsername(pureUsername, site);

    return {
        title: `User timeline for ${username} on ${site}`,
        link: `https://${site}/@${pureUsername}`,
        item: utils.parseNotes(accountData, site),
    };
}
