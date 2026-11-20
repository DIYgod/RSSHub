import { promisify } from 'node:util';
import { gunzip as gunzipCallback } from 'node:zlib';

import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import markdownit from '@/utils/markdown-it';
import ofetch from '@/utils/ofetch';
import { parseDate, toISOString } from '@/utils/time';

const gunzip = promisify(gunzipCallback);

const md = markdownit({
    breaks: true,
    html: true,
});

export const route: Route = {
    path: '/changelog',
    example: '/typeless/changelog',
    categories: ['program-update'],
    radar: [
        {
            source: ['www.typeless.com/help/release-notes/*', 'www.typeless.com/help/release-notes', 'www.typeless.com'],
        },
    ],
    name: 'Changelog',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.typeless.com/help/release-notes',
};

function getReleaseDate(value: string | undefined) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return;
    }
    // Preserve the source calendar day without introducing the host timezone.
    const date = parseDate(`${value}T00:00:00Z`);
    return date && toISOString(date).startsWith(`${value}T`) ? date : undefined;
}

async function handler() {
    const baseUrl = 'https://www.typeless.com';
    const platforms = ['macos', 'windows', 'ios', 'android'];

    const decompressedData = await pMap(
        platforms,
        async (platform) => {
            const link = `${baseUrl}/help/release-notes/${platform}`;

            const response = await ofetch(link);
            const $ = load(response);

            const nextData = JSON.parse($('#__NEXT_DATA__').text());
            const pageProps = nextData.props.pageProps;

            return cache.tryGet<{ appPlatform: string; decompressedData: any[] }>(`typeless:changelog:${platform}:${pageProps.updatedAt}`, async () => {
                const compressedData = pageProps.compressedData;

                const decodedString = Buffer.from(compressedData, 'base64');
                const decompressed = await gunzip(decodedString);
                const changelogData = JSON.parse(decompressed.toString('utf-8'));

                return {
                    appPlatform: pageProps.platform,
                    decompressedData: Object.values<any>(changelogData),
                };
            });
        },
        { concurrency: 3 }
    );

    const items = decompressedData.flatMap((platform) =>
        platform.decompressedData.map((item) => {
            const features = item.features[0];
            return {
                title: features.title,
                description: md.render(features.content),
                pubDate: getReleaseDate(item.date),
                link: new URL(features.learnMore || `/help/release-notes/${platform.appPlatform}#${item.date}`, baseUrl).href,
                category: [platform.appPlatform],
                guid: `typeless:${platform.appPlatform}:${item.version}`,
            };
        })
    );

    return {
        title: 'Typeless app release notes',
        link: `${baseUrl}/help/release-notes`,
        image: `${baseUrl}/logo_500.png`,
        item: items,
    };
}
