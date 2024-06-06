import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/topic/:interest',
    example: '/academia/topic/Urban_History',
    parameters: { interest: 'interest' },
    radar: [
        {
            source: ['academia.edu/Documents/in/:interest'],
            target: '/topic/:interest',
        },
    ],
    name: 'interest',
    maintainers: ['K33k0'],
    categories: ['journal'],
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
            const tagsElem = $(item).find('li.InlineList-item.u-positionRelative > span > script').text().replaceAll('}{', '},{');
            let categories = [];
            if (tagsElem !== null) {
                const categoriesJSON = JSON.parse(`[${tagsElem}]`);
                categories = categoriesJSON.map((category) => category.name);
            }

            return {
                title: $(item).find('.header .title').text(),
                link: $(item).find('.header .title > a').attr('href'),
                author: $(item).find('span[itemprop=author] > a').text(),
                description: $(item).find('.complete').text(),
                category: categories,
            };
        });
    return {
        title: `academia.edu | ${interest} documents`,
        link: `https://academia.edu/Documents/in/${interest}/MostRecent`,
        item: list,
    };
}
