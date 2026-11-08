import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/releases',
    categories: ['program-update'],
    example: '/manictime/releases',
    name: 'Releases',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.manictime.com/Releases';
    const response = await ofetch(rootUrl);

    const $ = load(response);

    const items = $('article.rln-item')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.attr('data-version')!;
            const dateText = $item.attr('data-date');
            return {
                link: `${rootUrl}#:~:text=${encodeURIComponent(title).replaceAll('-', '%2D')}`,
                title,
                description: $item.find('.rln-body').html(),
                pubDate: dateText ? parseDate(`${dateText} GMT`) : undefined,
            };
        });

    return {
        title: 'ManicTime releases',
        link: rootUrl,
        item: items,
    };
}
