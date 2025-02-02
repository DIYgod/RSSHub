import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { queryToBoolean } from '@/utils/readable-social';
import querystring from 'querystring';
import utils from './utils';

export const route: Route = {
    path: '/timeline/home/:site/:routeParams?',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/misskey/timeline/home/misskey.io',
    parameters: {
        site: 'instance address, domain only, without `http://` or `https://` protocol header',
        routeParams: `
            | Key                  | Description                             | Accepted Values | Default |
            | -------------------- | --------------------------------------- | --------------- | ------- |
            | limit                | Number of notes to return               | integer         | 10      |
            | withFiles            | Only return notes containing files      | 0/1/true/false  | false   |
            | withRenotes          | Include renotes in the timeline         | 0/1/true/false  | true    |
            | allowPartial         | Allow partial results                   | 0/1/true/false  | true    |
            | simplifyAuthor       | Simplify author field in feed items     | 0/1/true/false  | true    |

            Note: If \`withFiles\` is set to true, renotes will not be included in the timeline regardless of the value of \`withRenotes\`.

            Examples:
            - /misskey/timeline/home/misskey.io/limit=20&withFiles=true
            - /misskey/timeline/home/misskey.io/withRenotes=false
        `,
    },
    features: {
        requireConfig: [
            {
                name: 'MISSKEY_ACCESS_TOKEN',
                optional: false,
                description: `
                    Access token for Misskey API. Requires \`read:account\` access.

                    Visit the specified site's settings page to obtain an access token. E.g. https://misskey.io/settings/api
                `,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['misskey.io'],
        },
    ],
    name: 'Home Timeline',
    maintainers: ['HanaokaYuzu'],
    handler,
    description: `
        ::: warning
            This route is only available for self-hosted instances.
        :::
    `,
};

async function handler(ctx) {
    const access_token = config.misskey.accessToken;
    if (!access_token) {
        throw new ConfigNotFoundError('Missing access token for Misskey API. Please set `MISSKEY_ACCESS_TOKEN` environment variable.');
    }

    const site = ctx.req.param('site');
    if (!config.feature.allow_user_supply_unsafe_domain && !utils.allowSiteList.includes(site)) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    // docs on: https://misskey.io/api-doc#tag/notes/operation/notes___timeline
    const url = `https://${site}/api/notes/timeline`;
    const routeParams = querystring.parse(ctx.req.param('routeParams'));
    const response = await got({
        method: 'post',
        url,
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
        json: {
            limit: Number(routeParams.limit ?? 10),
            withFiles: queryToBoolean(routeParams.withFiles ?? false),
            withRenotes: queryToBoolean(routeParams.withRenotes ?? true),
            allowPartial: queryToBoolean(routeParams.allowPartial ?? true),
        },
    });

    const list = response.data;
    const simplifyAuthor = queryToBoolean(routeParams.simplifyAuthor ?? true);

    return {
        title: `Home Timeline on ${site}`,
        link: `https://${site}`,
        item: utils.parseNotes(list, site, simplifyAuthor),
    };
}
