import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/release_notes',
    categories: ['program-update'],
    example: '/sesame/release_notes',
    name: 'Release Notes',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://sesame.ninja/release_notes.txt';
    const response = await ofetch(rootUrl, { responseType: 'text' });

    const items = response
        .split('\r\n\r\n')
        .slice(0, 20)
        .map((item) => {
            const splits = item.split('\r\n - ');
            const title = splits.shift()!.replace(':', '');

            return {
                title,
                link: rootUrl,
                pubDate: title.match(/\((.*),/)![1],
                description: `<ul><li>${splits.join('</li><li>')}</ul>`,
            };
        });

    return {
        title: 'Sesame Release Notes',
        link: rootUrl,
        item: items,
    };
}
