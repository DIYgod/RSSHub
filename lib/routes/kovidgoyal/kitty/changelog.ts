import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/kitty/changelog',
    categories: ['program-update'],
    example: '/kovidgoyal/kitty/changelog',
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
            source: ['sw.kovidgoyal.net/kitty/changelog/'],
            target: '/kitty/changelog',
        },
    ],
    name: 'Changelog',
    maintainers: ['xbot'],
    handler,
    url: 'sw.kovidgoyal.net/kitty/changelog/',
};

async function handler() {
    const url = 'https://sw.kovidgoyal.net/kitty/changelog/';
    const response = await ofetch(url);
    const $ = load(response);

    // Find the "Detailed list of changes" section
    const detailedSection = $('#detailed-list-of-changes');

    const items = detailedSection
        .find('section[id^="id"]')
        .toArray()
        .map((section) => {
            const $section = $(section);

            // Extract version and date from h3 title
            const titleText = $section.find('h3').first().text().trim();
            const versionMatch = titleText.match(/^([\d.]+)\s*\[([^\]]+)\]/);

            if (!versionMatch) {
                return null;
            }

            const version = versionMatch[1];
            const dateStr = versionMatch[2];

            // Extract changelog items from the ul list
            const changelogItems = $section
                .find('ul.simple li')
                .toArray()
                .map((li) => $(li).html())
                .filter(Boolean);

            // Create description from changelog items
            const description = changelogItems.length > 0 ? '<ul>' + changelogItems.map((item) => `<li>${item}</li>`).join('') + '</ul>' : 'No changelog items available.';

            return {
                title: `Kitty ${version}`,
                description,
                link: `${url}#${$section.attr('id')}`,
                pubDate: parseDate(dateStr, 'YYYY-MM-DD'),
                guid: `kitty-${version}`,
            };
        })
        .filter(Boolean);

    return {
        title: 'Kitty Changelog',
        link: url,
        description: 'Changelog for Kitty terminal emulator',
        language: 'en',
        item: items,
    };
}
