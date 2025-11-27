import type { Route } from '@/types';
import { toTitleCase } from '@/utils/common-utils';
import ofetch from '@/utils/ofetch';

function parseTitle(smartlinkUrl: string): string {
    try {
        const url = new URL(smartlinkUrl);
        const pathSegments = url.pathname.split('/').filter((segment) => segment.length > 0);

        // Find the segment after the date (YYYY-MM-DD pattern)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const dateIndex = pathSegments.findIndex((segment) => dateRegex.test(segment));

        // Use the segment after the date if found, otherwise use the last path segment
        const titleSlug = dateIndex !== -1 && dateIndex < pathSegments.length - 1 ? pathSegments[dateIndex + 1] : pathSegments.at(-1) || '';

        // Convert hyphens to spaces and capitalize each word
        return toTitleCase(titleSlug.replaceAll('-', ' '));
    } catch {
        // If URL parsing fails, return the URL without query parameters as fallback
        return smartlinkUrl.split('?')[0];
    }
}

function isYouTubeUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname.toLowerCase();
        return hostname === 'youtube.com' || hostname === 'www.youtube.com' || hostname === 'm.youtube.com' || hostname === 'youtu.be';
    } catch {
        return false;
    }
}

function getTitle(item: any): string {
    return isYouTubeUrl(item.smartlink)
        ? item.smartlink.split('?')[0] // For YouTube URLs, use the URL without query parameters
        : parseTitle(item.smartlink); // Use existing parseTitle for other URLs
}

export const route: Route = {
    path: '/:site',
    categories: ['social-media'],
    example: '/smartlink/bloombergpursuits',
    parameters: { site: 'the site attached to smartlink.bio/' },
    radar: [
        {
            source: ['smartlink.bio/'],
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Posts',
    maintainers: ['nickyfoto'],
    handler,
    description: 'smartlink.bio link in bio takes your audience from Instagram and TikTok to your website in one easy step.',
};

async function handler(ctx) {
    const site = ctx.req.param('site');
    const link = `https://smartlink.bio/api/instagram/${site}/posts`;
    const data = await ofetch(link);
    // the API returns text/plain as MIME type
    // Parse the JSON string into an array
    const parsedData = JSON.parse(data);
    const items = parsedData.map((item) => ({
        title: getTitle(item),
        link: item.smartlink.split('?')[0],
        description: `<p><img src="${item.imageUrl}"></p>`,
        pubDate: item.created,
        guid: item.id,
    }));
    return {
        title: `@${site} SmartLink`,
        link: `https://smartlink.bio/${site}`,
        item: items,
    };
}
