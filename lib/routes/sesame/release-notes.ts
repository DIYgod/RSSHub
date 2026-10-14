import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
            const date = title.match(/\((\d{4}-\d{2}-\d{2}),/)?.[1];

            return {
                title,
                guid: title,
                link: rootUrl,
                pubDate: date ? parseDate(`${date}T00:00:00Z`) : undefined,
                description: `<ul><li>${splits.join('</li><li>')}</li></ul>`,
            };
        });

    return {
        title: 'Sesame Release Notes',
        link: rootUrl,
        item: items,
    };
}
