import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const platformSlugs = {
    desktop: 'releasenotes',
    beta: 'beta/notes',
    nightly: 'nightly/notes',
    android: 'android/releasenotes',
    ios: 'ios/notes',
};

export const route: Route = {
    path: '/release/:platform?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { platform = 'desktop' } = ctx.req.param();
    const devicePlatform = platform.replace('-', '/');

    const link = ['https://www.mozilla.org/en-US/firefox', Object.hasOwn(platformSlugs, devicePlatform) ? platformSlugs[devicePlatform] : devicePlatform].filter(Boolean).join('/');
    const response = await got.get(link);
    const $ = load(response.data);
    const version = $('.c-release-version').text();
    const pubDate = parseDate($('.c-release-date').text(), 'MMMM D, YYYY');

    return {
        title: `Firefox ${platform} release notes`,
        link,
        item: [
            {
                title: `Firefox ${platform} ${version} release notes`,
                link,
                description: $('.c-release-notes').html(),
                guid: `${platform} ${version}`,
                pubDate,
            },
        ],
    };
}
