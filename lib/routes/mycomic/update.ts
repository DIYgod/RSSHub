import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export const route: Route = {
    path: '/update/:id',
    categories: ['anime'],
    example: 'mycomic/update/1759',
    parameters: { id: 'ID of the comic (e.g. 1759 for 獵人)' },
    radar: [
        {
            source: ['mycomic.com/comics/:id'],
            target: '/update/:id',
        },
    ],
    name: 'Comic Updates',
    maintainers: ['canonnizq'],

    handler: async (ctx) => {
        const { id } = ctx.req.param();
        const url = `https://mycomic.com/comics/${id}`;

        const response = await ofetch(url);
        const $ = load(response);

        const container = $('div.space-y-2.5 div.space-y-2.5').first();

        const items = container.find('div.flex').toArray().map((item) => {
            const element = $(item);
            const date = element.find('div.flex-none.text-sm.text-zinc-500.dark:text-zinc-300.ml-2').text();

            return {
                title: element.find('div.truncate.grow.text-sm.text-zinc-500.dark:text-zinc-300').text(),
                link: element.find('a').first().attr('href'),
                pubDate: parseDate(date),
            };
        });

        return {
            title: `Updates for ${$('div.truncate.whitespace-nowrap').text()}`,
            link: url,
            items: items,
        };
    },
};