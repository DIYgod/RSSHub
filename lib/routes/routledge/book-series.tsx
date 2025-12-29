import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:bookName/book-series/:bookId',
    radar: [
        {
            source: ['routledge.com/:bookName/book-series/:bookId'],
        },
    ],
    name: 'Unknown',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
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

                item.description = renderDescription(image, description.html());
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: pageUrl,
        item: items,
    };
}

const renderDescription = (image: string | undefined, description: string | null): string =>
    renderToString(
        <>
            {image ? (
                <>
                    <img src={image} />
                    <br />
                </>
            ) : null}
            {description ? raw(description) : null}
        </>
    );
