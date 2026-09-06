import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/changes',
    categories: ['program-update'],
    example: '/voidtools/changes',
    name: 'Everything Changes',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.voidtools.com/Changes.txt';

    const response = await ofetch(rootUrl, { responseType: 'text' });

    const items = response
        .replaceAll('\r\n', '\n')
        .replaceAll(/\t\n\n|\t\n/g, '\n\n')
        .split('\n\n')
        .map((block) => {
            const item = block.startsWith('\n') ? block.slice(2) : block;

            const title = item.split('\n', 1)[0].split(':');
            const description = `<ul>${item.split(title[1])[1].replaceAll('\t', '<li>').replaceAll('\n', '</li>')}</ul>`;

            return {
                description,
                link: rootUrl,
                title: title[1],
                pubDate: parseDate(title[0]),
            };
        });

    return {
        title: 'Everything - Changes',
        link: rootUrl,
        item: items,
    };
}
