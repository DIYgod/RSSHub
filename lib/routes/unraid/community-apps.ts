import type { Route } from '@/types';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

const appFeedUrl = 'https://raw.githubusercontent.com/Squidly271/AppFeed/master/applicationFeed.json';
const defaultLimit = 20;

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function sortIdentityFields(_key: string, value: JsonValue) {
    return value && typeof value === 'object' && !Array.isArray(value) ? Object.fromEntries(Object.entries(value).toSorted(([left], [right]) => left.localeCompare(right))) : value;
}

function getAppIdentity(app: { [key: string]: JsonValue }) {
    const fields = Object.fromEntries(Object.entries(app).filter(([field]) => !['TemplateURL', 'TemplatePath', 'Repo'].includes(field)));
    return JSON.stringify(fields, sortIdentityFields);
}

export const route: Route = {
    path: '/community-apps',
    categories: ['program-update'],
    example: '/unraid/community-apps',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['unraid.net/community/apps'],
        },
    ],
    name: 'Community Apps',
    maintainers: ['KTachibanaM'],
    handler,
    url: 'unraid.net/community/apps',
};

async function handler(ctx) {
    const { data } = await got(appFeedUrl, { maxResponseSize: 64 * 1024 * 1024 }); // the feed lists every app, 22 MB now
    const limit = getRouteLimit(ctx, defaultLimit);

    let appList = data.applist.filter((app) => typeof app.Name === 'string' && app.Name.length > 0);
    appList = appList.map((app) => {
        const pubDate = app.LastUpdate ?? app.FirstSeen;
        return {
            ...app,
            pubDate,
        };
    });
    appList.sort((a, b) => b.pubDate - a.pubDate);
    const identities = new Set<string>();
    const returnedAppList = appList
        .filter((app) => {
            const identity = getAppIdentity(app);
            if (identities.has(identity)) {
                return false;
            }
            identities.add(identity);
            return true;
        })
        .slice(0, limit);

    return {
        title: 'Unraid Community Apps',
        link: 'https://unraid.net/community/apps',
        image: 'https://craftassets.unraid.net/static/favicon/favicon.ico?v=1.0',
        item: returnedAppList.map((app) => ({
            guid: app.TemplateURL ?? app.Repository ?? app.Registry ?? `https://unraid.net/community/apps?q=${app.Name}`,
            title: `${app.Name} (${app.Repository ?? 'Unknown repository'})`,
            link: app.Registry || `https://unraid.net/community/apps?q=${app.Name}`,
            description: app.Overview?.replaceAll('\r\n', '<br>').replaceAll('\n', '<br>').replaceAll('[br]', '<br>'),
            pubDate: parseDate(app.pubDate * 1000),
            image: app.Icon,
            category: app.CategoryList,
            upvotes: app.stars,
        })),
    };
}
