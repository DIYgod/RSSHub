import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/release',
    categories: ['program-update'],
    example: '/thunderbird/release',
    name: 'Changelog',
    maintainers: ['garywill'],
    handler,
};

async function handler() {
    const releasesResponse = await ofetch('https://www.thunderbird.net/en-US/thunderbird/releases/');
    const version = load(releasesResponse)('.release-container').first().find('a').last().text();

    const notesResponse = await ofetch(`https://www.thunderbird.net/en-US/thunderbird/${version}/releasenotes/`);
    const $ = load(notesResponse);
    const releasedDate = $('main .release-text-container h4')
        .text()
        .match(/Released (.+)$/)?.[1];
    const content = $('main .release-notes-container').html();

    return {
        title: 'Thunderbird release note',
        link: 'https://www.thunderbird.net/',
        item: [
            {
                title: `Thunderbird ${version} release`,
                guid: version,
                pubDate: releasedDate ? parseDate(`${releasedDate} +0000`, 'MMMM D, YYYY ZZ') : undefined,
                link: `https://www.thunderbird.net/en-US/thunderbird/${version}/releasenotes`,
                description: content,
            },
        ],
    };
}
