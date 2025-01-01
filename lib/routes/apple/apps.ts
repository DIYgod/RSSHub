import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const platformIds = {
    osx: 'macOS',
    ios: 'iOS',
    appletvos: 'tvOS',
};

const platforms = {
    macos: 'osx',
    ios: 'ios',
    tvos: 'appletvos',
};

export const route: Route = {
    path: '/apps/update/:country/:id/:platform?',
    categories: ['program-update', 'popular'],
    view: ViewType.Notifications,
    example: '/apple/apps/update/us/id408709785',
    parameters: {
        country: 'App Store Country, obtain from the app URL, see below',
        id: 'App id, obtain from the app URL',
        platform: {
            description: 'App Platform, see below, all by default',
            options: [
                {
                    value: 'All',
                    label: 'all',
                },
                {
                    value: 'iOS',
                    label: 'iOS',
                },
                {
                    value: 'macOS',
                    label: 'macOS',
                },
                {
                    value: 'tvOS',
                    label: 'tvOS',
                },
            ],
        },
    },
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
            source: ['apps.apple.com/:country/app/:appSlug/:id', 'apps.apple.com/:country/app/:id'],
            target: '/apps/update/:country/:id',
        },
    ],
    name: 'App Update',
    maintainers: ['EkkoG', 'nczitzk'],
    handler,
    description: `
::: tip
  For example, the URL of [GarageBand](https://apps.apple.com/us/app/messages/id408709785) in the App Store is \`https://apps.apple.com/us/app/messages/id408709785\`. In this case, the \`App Store Country\` parameter for the route is \`us\`, and the \`App id\` parameter is \`id1146560473\`. So the route should be [\`/apple/apps/update/us/id408709785\`](https://rsshub.app/apple/apps/update/us/id408709785).
:::`,
};

async function handler(ctx) {
    const { country, id } = ctx.req.param();
    let { platform } = ctx.req.param();

    let platformId;

    if (platform && platform !== 'all') {
        platform = platform.toLowerCase();
        platformId = Object.hasOwn(platforms, platform) ? platforms[platform] : platform;
    }
    platform = undefined;

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 100;

    const rootUrl = 'https://apps.apple.com';
    const currentUrl = new URL(`${country}/app/${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const appData = JSON.parse(Object.values(JSON.parse($('script#shoebox-media-api-cache-apps').text()))[0]);
    const attributes = appData.d[0].attributes;

    const appName = attributes.name;
    const artistName = attributes.artistName;
    const platformAttributes = attributes.platformAttributes;

    let items = [];
    let title = '';
    let description = '';

    if (platformId && Object.hasOwn(platformAttributes, platformId)) {
        platform = Object.hasOwn(platformIds, platformId) ? platformIds[platformId] : platformId;

        const platformAttribute = platformAttributes[platformId];

        items = platformAttribute.versionHistory;
        title = `${appName}${platform ? ` for ${platform} ` : ' '}`;
        description = platformAttribute.description.standard;
    } else {
        title = appName;
        for (const pid of Object.keys(platformAttributes)) {
            const platformAttribute = platformAttributes[pid];
            items = [
                ...items,
                ...platformAttribute.versionHistory.map((v) => ({
                    ...v,
                    platformId: pid,
                })),
            ];
            description += platformAttribute.description.standard;
        }
    }

    items = items.slice(0, limit).map((item) => {
        const pid = item.platformId ?? platformId;
        const p = platform ?? (Object.hasOwn(platformIds, pid) ? platformIds[pid] : pid);

        return {
            title: `${appName} ${item.versionDisplay} for ${p}`,
            link: currentUrl,
            description: item.releaseNotes?.replace(/\n/g, '<br>'),
            category: [p],
            guid: `apple/apps/${country}/${id}/${pid}#${item.versionDisplay}`,
            pubDate: parseDate(item.releaseTimestamp),
        };
    });

    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.set('json', {
        appData,
    });

    return {
        item: items,
        title: `${title} - Apple App Store`,
        link: currentUrl,
        description: description?.replace(/\n/g, ' '),
        language: $('html').prop('lang'),
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        subtitle: appName,
        author: artistName,
        allowEmpty: true,
    };
}
