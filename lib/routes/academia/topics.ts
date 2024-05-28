import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/topic/:interest',
    example: '/academia/topic/Urban_History',
    radar: [
        {
            source: ['academia.edu/Documents/in/:interest'],
            target: '/topic/:interest',
        },
    ],
    name: 'interest',
    maintainers: ['k33k0'],
    handler,
    url: 'academia.edu',
};

async function handler(ctx) {
    const interest = ctx.req.param('interest');
    const response = await ofetch(`https://www.academia.edu/Documents/in/${interest}/MostRecent`);
    const $ = load(response);
    const list = $('.works > .u-borderBottom1')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: $(item).find('.title > a').first().text(),
                link: $(item).find('.title > a').first().attr('href'),
                author: $(item).find('span[itemprop=author] > a').text(),
                description: $(item).find('.summarized').text(),
            };
        });
    return {
        title: `academia.edu | ${interest} documents`,
        link: `https://academia.edu/Documents/in/${interest}/MostRecent`,
        item: list,
    };
}
