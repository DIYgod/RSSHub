import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/shortcuts',
    categories: ['new-media', 'popular'],
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
    const {
        data: { data: categories },
    } = await got('https://shortcuts.sspai.com/api/v1/user/workflow/all/get');

    const items = [];

    for (const category of categories) {
        for (const shortcut of category.data || []) {
            items.push({
                title: shortcut.name,
                description: `作者：<a href="${shortcut.author_url || '#'}">${shortcut.author_id}</a><br/>${decodeURIComponent((shortcut.description || '').replaceAll('+', '%20'))}`,
                pubDate: parseDate(shortcut.utime * 1000),
                guid: shortcut.id,
                link: shortcut.url,
            });
        }
    }

    return {
        title: 'Shortcuts Gallery - 少数派',
        link: 'https://shortcuts.sspai.com/#/main/workflow',
        description: 'Shortcuts Gallery - 少数派',
        item: items,
    };
}
