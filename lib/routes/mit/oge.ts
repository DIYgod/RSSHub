import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/oge/:type?/:name?',
    categories: ['university'],
    example: '/mit/oge/department/electrical-engineering-and-computer-science',
    parameters: {
        type: {
            description: 'Filter type',
            options: [
                { value: 'category', label: 'Blog category' },
                { value: 'department', label: 'Department' },
            ],
        },
        name: 'Filter value, can be found in the filter URL of the blog page, e.g. `electrical-engineering-and-computer-science` in `https://oge.mit.edu/news-and-events/blog/?_sft_department=electrical-engineering-and-computer-science`',
    },
    radar: [
        {
            source: ['oge.mit.edu/news-and-events/blog'],
            target: '/oge',
        },
    ],
    name: 'Office of Graduate Education Blog',
    maintainers: ['LogicJake'],
    handler,
    url: 'oge.mit.edu/news-and-events/blog',
};

const host = 'https://oge.mit.edu';

async function handler(ctx: Context) {
    const { type, name } = ctx.req.param();

    const filter = type === 'category' ? '_sft_blog_category' : type === 'department' ? '_sft_department' : undefined;
    const link = filter && name ? `${host}/news-and-events/blog/?${filter}=${name}` : `${host}/news-and-events/blog/`;

    const response = await ofetch(`${host}/`, {
        query: {
            sfid: '112',
            sf_action: 'get_data',
            sf_data: 'results',
            lang: 'en',
            ...(filter && name && { [filter]: name }),
        },
    });
    const $ = load(response.results);

    const list = $('.search-filter-result')
        .toArray()
        .map((elem) => {
            const $elem = $(elem);
            const a = $elem.find('h3 a');
            const [date, author] = $elem.find('p.meta-date').text().split('|', 2);
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate(date),
                author: author?.trim(),
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const $$ = load(detailResponse);

                const description = $$('.blog-main .col-12').first();
                description.find('h2, p.meta-date').remove();
                item.description = description.html() ?? undefined;

                return item;
            })
        )
    );

    return {
        title: `MIT Office of Graduate Education Blog${name ? ` - ${name}` : ''}`,
        link,
        item: items,
    };
}
