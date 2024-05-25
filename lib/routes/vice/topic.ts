import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/topic/:topic/:language?',
    categories: ['traditional-media'],
    example: '/vice/politics/true/en',
    parameters: {
        topic: 'Can be found in the URL',
        content: 'Set to true to retrieve the full article (images are blurry), anything else will pull the short text',
        language: 'defaults to `en`, use the website to discover other codes',
    },
    radar: [
        {
            source: ['www.vice.com/:language/topic/:topic'],
            target: '/:topic/false/:language',
        },
    ],
    name: 'Topic',
    maintainers: ['K33k0'],
    handler,
    url: 'vice.com/',
};

async function handler(ctx) {
    const { language = 'en', topic } = ctx.req.param();
    let items = null;
    const response = await ofetch(`https://www.vice.com/${language ?? 'en'}/topic/${topic}`);
    const $ = load(response);
    const list = $('.vice-card')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: $(item).find('h3').first().text(),
                link: `https://vice.com${$(item).find('h3 > a').first().attr('href')}`,
                pubDate: parseDate(new Date($(item).find('time').first().attr('datetime') * 1)),
                author: $(item).find('.vice-card-details__byline').first().text(),
                description: $(item).find('.vice-card-dek').first().text(),
            };
        });
    // if content true pull the full article.
    // images come through blury, default is to pull the short text
    items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                // Select the first element with the class name 'comment-body'
                item.description = $('.short-form').first().html();

                // Every property of a list item defined above is reused here
                // and we add a new property 'description'
                return item;
            })
        )
    );

    return {
        // channel title
        title: `Vice.com | ${topic} articles`,
        // channel link
        link: `https://vice.com/${language}/topic/${topic}`,
        // each feed item
        item: items,
    };
}
