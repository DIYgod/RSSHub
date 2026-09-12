import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/beta',
    categories: ['program-update'],
    example: '/sketch/beta',
    name: 'Beta update',
    maintainers: ['Jeason0228'],
    handler,
};

async function handler() {
    const link = 'https://www.sketch.com/beta/';
    const response = await ofetch(link);
    const $ = load(response);

    const [version, released] = $('.beta__release-blurb').text().trim().replaceAll(/\s+/g, ' ').split(' released on ', 2);

    return {
        title: 'Sketch Beta',
        link,
        description: 'Sketch is a design toolkit built to help you create your best work — from your earliest ideas, through to final artwork.',
        image: 'https://cdn.sketchapp.com/assets/components/block-buy/logo.png',
        item: [
            {
                title: version,
                description: $('.beta__release-notes').html(),
                link,
                pubDate: parseDate(released, 'D MMMM YYYY'),
                guid: version,
            },
        ],
    };
}
