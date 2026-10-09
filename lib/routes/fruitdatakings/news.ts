import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const link = 'https://www.fruitdatakings.com/rss_category/';

export const route: Route = {
    path: '/news/:product?',
    example: '/fruitdatakings/news/cherry',
    name: 'Product news',
    categories: ['traditional-media'],
    maintainers: ['DIYgod'],
    parameters: { product: 'Product selected in the website’s news form, defaults to cherry. For example: cherry or kiwi.' },
    description: 'Includes news headlines and links from the public product-news form. Source headlines may be shortened; full articles are hosted by external publishers. Paid market charts are not part of this feed.',
    radar: [{ source: ['www.fruitdatakings.com/rss_category/'], target: '/news' }],
    handler,
};

async function handler(ctx) {
    const product = ctx.req.param('product') ?? 'cherry';
    const response = await ofetch.raw(link, { responseType: 'text' });
    const $ = load(response._data!);
    if (
        $('input[name="keywords"]')
            .toArray()
            .every((input) => $(input).attr('value') !== product)
    ) {
        throw new InvalidParameterError('Select a product offered in Fruit Data Kings’ public news form.');
    }
    const token = $('input[name="csrfmiddlewaretoken"]').attr('value')!;
    const cookie = response.headers
        .getSetCookie()
        .map((value) => value.split(';', 1)[0])
        .join('; ');
    const result = await ofetch(link, { method: 'POST', headers: { Referer: link, Cookie: cookie }, body: new URLSearchParams({ csrfmiddlewaretoken: token, keywords: product }), responseType: 'text' });
    const news = load(result);
    return {
        title: `Fruit Data Kings - ${product}`,
        link,
        language: 'en' as const,
        item: news('.news-grid tr')
            .toArray()
            .map((row) => {
                const element = news(row);
                const articleLink = element
                    .find('button')
                    .attr('onclick')
                    ?.match(/window\.open\('([^']+)'/)?.[1];
                return { title: element.find('td').first().text(), link: articleLink, category: [product] };
            }),
    };
}
