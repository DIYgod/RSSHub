import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { Data, Route, ViewType } from '@/types';
import { fallback, queryToBoolean } from '@/utils/readable-social';
import querystring from 'node:querystring';
import utils from './utils';

export const route: Route = {
    path: '/users/notes/:username/:routeParams?',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/misskey/users/notes/support@misskey.io',
    parameters: {
        username: 'Misskey username in the format of username@instance.domain',
        routeParams: `
| Key               | Description                             | Accepted Values | Default |
| ----------------- | --------------------------------------- | --------------- | ------- |
| withRenotes       | Include renotes in the timeline         | 0/1/true/false  | false   |
| mediaOnly         | Only return posts containing media      | 0/1/true/false  | false   |
| simplifyAuthor    | Simplify author field in feed items     | 0/1/true/false  | false   |

Note: \`withRenotes\` and \`mediaOnly\` are mutually exclusive and cannot both be set to true.

Examples:
- /misskey/users/notes/mttb2ccp@misskey.io/withRenotes=true
- /misskey/users/notes/mttb2ccp@misskey.io/mediaOnly=true`,
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User timeline',
    maintainers: ['siygle', 'SnowAgar25', 'HanaokaYuzu'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const username = ctx.req.param('username');
    const [, pureUsername, site] = username.match(/@?(\w+)@(\w+\.\w+)/) || [];
    if (!pureUsername || !site) {
        throw new InvalidParameterError('Provide a valid Misskey username');
    }
    if (!config.feature.allow_user_supply_unsafe_domain && !utils.allowSiteList.includes(site)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const routeParams = querystring.parse(ctx.req.param('routeParams'));
    const withRenotes = fallback(undefined, queryToBoolean(routeParams.withRenotes), false);
    const mediaOnly = fallback(undefined, queryToBoolean(routeParams.mediaOnly), false);
    const simplifyAuthor = fallback(undefined, queryToBoolean(routeParams.simplifyAuthor), false);

    // Check for conflicting parameters
    if (withRenotes && mediaOnly) {
        throw new InvalidParameterError('withRenotes and mediaOnly cannot both be true.');
    }

    const { accountData, avatarUrl } = await utils.getUserTimelineByUsername(pureUsername, site, {
        withRenotes,
        mediaOnly,
    });

    return {
        title: `User timeline for ${username} on ${site}`,
        link: `https://${site}/@${pureUsername}`,
        image: avatarUrl ?? '',
        item: utils.parseNotes(accountData, site, simplifyAuthor),
    };
}
