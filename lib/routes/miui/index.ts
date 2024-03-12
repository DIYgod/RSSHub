import { Route } from '@/types';
import got from '@/utils/got';
import cache from '@/utils/cache';
import queryString from 'query-string';

export const route: Route = {
    path: '/:device/:type?/:region?',
    categories: ['program-update'],
    example: '/miui/aries',
    parameters: { device: 'the device `codename` eg. `aries` for Mi 2S', type: 'type', region: 'Region, default to `cn`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'New firmware',
    maintainers: ['Indexyz'],
    description: "  | stable  | development |\n  | ------- | ----------- |\n  | release | dev         |\n\n  | region | region |\n  | ------ | ------ |\n  | China  | cn     |\n  | Global | global |",
    handler,
};

const cacheLength = 5;

async function handler(ctx) {
    const { type = 'release', device, region = 'cn' } = ctx.req.param();
    const releaseType = type === 'release' ? 'F' : 'X';
    const localeTypeName = type === 'release' ? '稳定版' : '开发版';
    const regionName = region === 'global' ? 'global' : 'cn';
    const cacheName = `RSSHubMIUIUpdate|${device}|${releaseType}|${regionName}`;

    const response = await got({
        method: 'get',
        url: 'http://update.miui.com/updates/miota-fullrom.php',
        searchParams: queryString.stringify({
            d: device,
            b: releaseType,
            r: regionName,
            l: 'zh_CN',
            n: '',
        }),
    });

    const responseData = response.data;
    let oldPosts = [];
    try {
        oldPosts = JSON.parse(await cache.get(cacheName));
    } catch {
        // no need handle here: parseError
    }

    if (oldPosts === null) {
        oldPosts = [];
    }

    let item = oldPosts;

    if (oldPosts.length === 0 || oldPosts[0].description !== responseData.LatestFullRom.filename) {
        item = [
            {
                title: `${device} 有新的 ${localeTypeName}本: ${responseData.LatestFullRom.version}`,
                guid: responseData.LatestFullRom.md5,
                description: responseData.LatestFullRom.filename,
                link: responseData.LatestFullRom.descriptionUrl,
            },
            ...oldPosts,
        ];

        cache.set(cacheName, item.slice(0, cacheLength));
    }

    return {
        title: `MIUI 更新 - ${device} - ${type === 'release' ? '稳定版' : '开发版'}`,
        link: 'http://www.miui.com/download.html',
        item,
    };
};
