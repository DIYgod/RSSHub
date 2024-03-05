import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const { bookName, bookId } = ctx.req.param();
    const baseUrl = 'https://www.routledge.com';
    const pageUrl = `${baseUrl}/${bookName}/book-series/${bookId}`;
    const { data: response } = await got(pageUrl, {
        headers: {
            accept: 'text/html, */*; q=0.01',
        },
        searchParams: {
            publishedFilter: 'alltitles',
            pd: 'published,forthcoming',
            pg: 1,
            pp: 12,
            so: 'pub',
            view: 'list',
        },
    });
    const $ = load(response);

    const list = $('.row.book')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('h3 a');
            const description = item.find('p.description');
            const meta = item.find('p.description').prev().text().split('\n');
            return {
                title: title.text(),
                link: title.attr('href'),
                description: description.text(),
                pubDate: parseDate(meta.pop().trim(), 'MMMM DD, YYYY'),
                author: meta
                    .map((i) => i.trim())
                    .filter(Boolean)
                    .join(', '),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = load(data);
                const isbn = $('meta[property="books:isbn"]').attr('content');
                const { data: image } = await got('https://productimages.routledge.com', {
                    searchParams: {
                        isbn,
                        size: 'amazon',
                        ext: 'jpg',
                    },
                });

                const description = $('.sticky-div');
                description.find('button.accordion-button').contents().unwrap();
                description.find('.fa-shopping-cart').parent().parent().remove();

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image,
                    description: description.html(),
                });
                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: pageUrl,
        item: items,
    });
};
