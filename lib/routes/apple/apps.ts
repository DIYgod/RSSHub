// @ts-nocheck
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

export default async (ctx) => {
    const { country, id } = ctx.req.param();
    let { platform } = ctx.req.param();

    let platformId;

    if (platform) {
        platform = platform.toLowerCase();
        platformId = Object.hasOwn(platforms, platform) ? platforms[platform] : platform;
    }
    platform = undefined;

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 100;

    const rootUrl = 'https://apps.apple.com';
    const currentUrl = new URL(`${country}/app/${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const subtitle = $('h2.whats-new__headline').text() || "What's New";

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
        title = `${appName}${platform ? ` for ${platform} ` : ' '}${subtitle}`;
        description = platformAttribute.description.standard;
    } else {
        title = `${appName} ${subtitle}`;
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

    ctx.set('data', {
        item: items,
        title,
        link: currentUrl,
        description: description?.replace(/\n/g, ' '),
        language: $('html').prop('lang'),
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        subtitle: appName,
        author: artistName,
        allowEmpty: true,
    });

    ctx.set('json', {
        appData,
    });
};
