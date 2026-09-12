import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

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
    $('main section').last().remove();
    $('main svg').remove();
    const content = $('main').html();

    return {
        title: 'Thunderbird release note',
        link: 'https://www.thunderbird.net/',
        item: [
            {
                title: `Thunderbird ${version} release`,
                guid: version,
                link: `https://www.thunderbird.net/en-US/thunderbird/${version}/releasenotes`,
                description: content,
            },
        ],
    };
}
