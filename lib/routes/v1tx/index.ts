import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['v1tx.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['TonyRL'],
    handler,
    url: 'v1tx.com/',
};

async function handler() {
    const baseUrl = 'https://www.v1tx.com';
    const { data: response } = await got(baseUrl);

    const $ = load(response);
    const list = $('h2.entry-title a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const data = JSON.parse($('script[type="application/ld+json"]').text());

                $('.entry-content figure > picture > source, noscript').remove();
                $('.entry-content img').each((_, img) => {
                    if (img.attribs.src.startsWith('data:')) {
                        img.attribs.src = img.attribs['data-lazy-src'];
                        delete img.attribs['data-lazy-src'];
                        delete img.attribs['data-lazy-srcset'];
                    }
                    img.attribs.src = img.attribs.src.replace(/-1024x\d+\.jpg/, '.webp').replace('.jpg', '.webp');
                    delete img.attribs.srcset;
                });

                item.pubDate = parseDate(data.datePublished);
                item.updated = parseDate(data.dateModified);
                item.description = $('.entry-content').html();

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: baseUrl,
        image: `${baseUrl}/wp-content/uploads/2018/10/cropped-Favicon.webp`,
        item: items,
    };
}
