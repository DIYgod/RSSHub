import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { appstoreBearerToken } from './utils';

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
    categories: ['program-update'],
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
  For example, the URL of [GarageBand](https://apps.apple.com/us/app/garageband/id408709785) in the App Store is \`https://apps.apple.com/us/app/garageband/id408709785\`. In this case, the \`App Store Country\` parameter for the route is \`us\`, and the \`App id\` parameter is \`id408709785\`. So the route should be [\`/apple/apps/update/us/id408709785\`](https://rsshub.app/apple/apps/update/us/id408709785).
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

    const bearer = await appstoreBearerToken();

    const response = await ofetch(`https://amp-api-edge.apps.apple.com/v1/catalog/${country}/apps/${id.replace('id', '')}`, {
        headers: {
            authorization: `Bearer ${bearer}`,
            origin: 'https://apps.apple.com',
        },
        query: {
            platform: 'iphone',
            additionalPlatforms: 'appletv,ipad,iphone,mac,realityDevice,watch',
            extend: 'accessibility,accessibilityDetails,ageRating,backgroundAssetsInfo,backgroundAssetsInfoWithOptional,customArtwork,customDeepLink,customIconArtwork,customPromotionalText,customScreenshotsByType,customVideoPreviewsByType,description,expectedReleaseDateDisplayFormat,fileSizeByDevice,gameDisplayName,iconArtwork,installSizeByDeviceInBytes,messagesScreenshots,miniGamesDeepLink,minimumOSVersion,privacy,privacyDetails,privacyPolicyUrl,remoteControllerRequirement,requirementsByDeviceFamily,supportURLForLanguage,supportedGameCenterFeatures,supportsFunCamera,supportsSharePlay,versionHistory,websiteUrl',
            'extend[app-events]': 'description,productArtwork,productVideo',
            include: 'alternate-apps,app-bundles,customers-also-bought-apps,developer,developer-other-apps,merchandised-in-apps,related-editorial-items,reviews,top-in-apps',
            'include[apps]': 'app-events',
            'availableIn[app-events]': 'future',
            'sparseLimit[apps:customers-also-bought-apps]': 40,
            'sparseLimit[apps:developer-other-apps]': 40,
            'sparseLimit[apps:related-editorial-items]': 40,
            'limit[reviews]': 8,
            l: 'en-US',
        },
    });

    const attributes = response.data[0].attributes;

    const appName = attributes.name;
    const artistName = attributes.artistName;
    const platformAttributes = attributes.platformAttributes;

    let items = [];
    let title = '';
    let description = '';
    let image = '';

    if (platformId && Object.hasOwn(platformAttributes, platformId)) {
        platform = Object.hasOwn(platformIds, platformId) ? platformIds[platformId] : platformId;

        const platformAttribute = platformAttributes[platformId];

        items = platformAttribute.versionHistory;
        title = `${appName}${platform ? ` for ${platform} ` : ' '}`;
        description = platformAttribute.description.standard;
        image = platformAttribute.iconArtwork?.url?.replace('{w}x{h}{c}.{f}', '3000x3000bb.webp');
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
            description = platformAttribute.description.standard;
            image = platformAttribute.iconArtwork?.url?.replace('{w}x{h}{c}.{f}', '3000x3000bb.webp');
        }
    }

    items = items.slice(0, limit).map((item) => {
        const pid = item.platformId ?? platformId;
        const p = platform ?? (Object.hasOwn(platformIds, pid) ? platformIds[pid] : pid);

        return {
            title: `${appName} ${item.versionDisplay} for ${p}`,
            link: currentUrl,
            description: item.releaseNotes?.replaceAll('\n', '<br>'),
            category: [p],
            guid: `apple/apps/${country}/${id}/${pid}#${item.versionDisplay}`,
            pubDate: parseDate(item.releaseTimestamp),
        };
    });

    return {
        item: items,
        title: `${title} - Apple App Store`,
        link: currentUrl,
        description: description?.replaceAll('\n', ' '),
        image,
        logo: image,
        subtitle: appName,
        author: artistName,
        allowEmpty: true,
    };
}
