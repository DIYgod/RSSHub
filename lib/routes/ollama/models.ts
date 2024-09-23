import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';

const supportedCategories = new Set(['library', 'tools', 'code', 'embedding', 'vision']);

export const route: Route = {
    path: '/:category',
    categories: ['programming'],
    example: '/ollama/library',
    radar: [
        {
            source: ['ollama.com/library'],
        },
    ],
    name: 'Ollama Models',
    maintainers: ['Nick22nd', 'gavrilov'],
    handler,
};

async function handler(ctx: any) {
    const params = ctx.req.param();
    const category = params.category;

    if (!supportedCategories.has(category)) {
        throw new Error(`Invalid category: ${category}`); // Handle invalid categories
    }

    const url = category === 'library' ? 'https://ollama.com/library?sort=newest' : `https://ollama.com/search?c=${category}&sort=newest`;

    const response = await ofetch(url);
    const $ = load(response);
    const items = $('#repo > ul > li > a')
        .toArray()
        .map((item) => {
            const name = $(item).find('h2 span').first();
            const link = $(item).attr('href');
            const description = $(item).find('div p.break-words').first();
            const pubDate = $(item).find('span:contains("Updated")').first();

            return {
                title: name.text(),
                link,
                description: description.text(),
                pubDate: parseRelativeDate(pubDate.text()),
            };
        });

    const title = category === 'library' ? 'ollama library all models' : `ollama library ${category} models`;

    return {
        title,
        link: url,
        item: items,
    };
}
