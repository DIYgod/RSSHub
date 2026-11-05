import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/search/:params?',
    categories: ['new-media'],
    example: '/bcg/search/f5=00000171-f12e-d394-ab73-f3ef7fc10000&f7=00000171-f17b-d394-ab73-f3fbae0d0000&f3=00000172-0efd-d58d-a97a-5eff51730077',
    parameters: {
        params: 'The query string of a www.bcg.com/search URL (`q`, `f3`, `f5`, `f7`, ...). Sort defaults to date (`s=1`).',
    },
    name: 'Search',
    maintainers: ['DIYgod'],
    radar: [{ source: ['www.bcg.com/search'] }],
    handler,
    url: 'www.bcg.com/search',
};

async function handler(ctx: Context) {
    const { params = '' } = ctx.req.param();
    const searchParams = new URLSearchParams(params);
    if (!searchParams.has('s')) {
        searchParams.set('s', '1');
    }
    const link = `https://www.bcg.com/search?${searchParams}`;
    const response = await ofetch(link);
    const $ = load(response);

    const facets = [
        ...new Set(
            $('.search-facets input:checked')
                .toArray()
                .map((input) => input.attribs['data-display'])
        ),
    ];

    return {
        title: `BCG Search - ${[searchParams.get('q'), ...facets].filter(Boolean).join(' / ')}`,
        link,
        item: $('a.result-link')
            .toArray()
            .map((element) => {
                const result = $(element);
                const subtitle = result.find('.subtitle');
                const category = subtitle.find('b').remove().text();
                return {
                    title: result.find('h2.title').text(),
                    link: result.attr('href')!,
                    description: `${$.html(result.find('img'))}${result.find('.result-content').html() ?? ''}`,
                    pubDate: parseDate(subtitle.text(), 'MMMM D, YYYY'),
                    category: [category],
                };
            }),
    };
}
