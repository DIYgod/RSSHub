import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const searchParams = new URLSearchParams({
    q: '',
    f5: '00000171-f12e-d394-ab73-f3ef7fc10000',
    f7: '00000171-f17b-d394-ab73-f3fbae0d0000',
    f3: '00000172-0efd-d58d-a97a-5eff51730077',
    s: '0',
});

export const route: Route = {
    path: '/infrastructure',
    categories: ['new-media'],
    example: '/bcg/infrastructure',
    name: 'Infrastructure insights',
    maintainers: ['DIYgod'],
    radar: [{ source: ['bcg.com/industries/urban-planning/infrastructure'], target: '/infrastructure' }],
    handler,
};

async function handler() {
    const link = `https://www.bcg.com/search?${searchParams}`;
    const response = await ofetch(link);
    const $ = load(response);
    return {
        title: 'BCG - Infrastructure insights',
        link,
        item: $('a.result-link')
            .toArray()
            .map((element) => {
                const result = $(element);
                const date = result
                    .find('.subtitle')
                    .text()
                    .match(/[A-Z][a-z]+ \d{1,2}, \d{4}/)?.[0];
                return {
                    title: result.find('h2.title').text(),
                    link: result.attr('href'),
                    description: `${$.html(result.find('img').first())}${result.find('.result-content').html() ?? ''}`,
                    pubDate: date ? parseDate(date, 'MMMM D, YYYY', 'en') : undefined,
                };
            }),
    };
}
