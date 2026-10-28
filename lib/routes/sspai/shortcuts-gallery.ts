import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/shortcuts',
    categories: ['new-media'],
    example: '/sspai/shortcuts',
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
            source: ['shortcuts.sspai.com/*'],
        },
    ],
    name: 'Shortcuts Gallery',
    maintainers: ['Andiedie'],
    handler,
    url: 'shortcuts.sspai.com/*',
};

async function handler() {
    const response = await got('https://shortcuts.sspai.com/api/v1/user/workflow/all/get');
    const categories = response.data?.data;
    if (!Array.isArray(categories)) {
        throw new TypeError('Shortcuts Gallery returned no workflow categories. Verify that its public workflow API is still available.');
    }

    const items = categories.flatMap((category) =>
        (category.data || []).map((shortcut) => ({
            title: shortcut.name,
            description: `作者：<a href="${shortcut.author_url || '#'}">${shortcut.author_id}</a><br/>${decodeURIComponent((shortcut.description || '').replaceAll('+', '%20'))}`,
            pubDate: parseDate(shortcut.utime * 1000),
            guid: shortcut.id,
            link: shortcut.url,
        }))
    );

    return {
        title: 'Shortcuts Gallery - 少数派',
        link: 'https://shortcuts.sspai.com/#/main/workflow',
        description: 'Shortcuts Gallery - 少数派',
        item: items,
    };
}
