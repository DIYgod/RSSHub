import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.simonsfoundation.org/news/what-were-reading';

export const route: Route = {
    path: '/recommend',
    categories: ['new-media'],
    example: '/simonsfoundation/recommend',
    name: "What We're Reading",
    maintainers: ['emdoe'],
    handler,
};

async function handler() {
    const response = await ofetch(baseUrl);
    const $ = load(response);

    return {
        title: `Simons Foundation | What We're Reading`,
        link: baseUrl,
        description: `Simons Foundation - What We're Reading`,
        item: $('.o-dated-list__row')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const day = $item.find('.o-dated-list__day').text();
                const month = $item.find('.o-dated-list__month').text();
                const year = $item.find('.o-dated-list__year').text();
                return {
                    title: $item.find('.m-post__title').text(),
                    description: $item.find('.m-post__aside').html(),
                    pubDate: day && month && year ? parseDate(`${day} ${month} ${year} +0000`, 'DD MMM YYYY ZZ') : undefined,
                    link: $item.find('.m-post__block-link').attr('href'),
                };
            }),
    };
}
