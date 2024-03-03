// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { category = 'trivia', language = 'tc' } = ctx.req.param();
    const rootUrl = 'https://www.consumer.org.hk';
    const currentUrl = `${rootUrl}/${language}/shopping-guide/${category}`;

    const { data: response } = await got(currentUrl, {
        headers: {
            cookie: `consumer_pagination={${encodeURI('"228c"')}:24}`,
        },
    });

    const $ = load(response);

    const list = $('.shadow-long-blk')
        .toArray()
        .map((item) => {
            item = $(item);

            const info = item
                .find('.item-info li')
                .toArray()
                .map((item) => $(item).text().trim());
            return {
                title: item.find('h2').text().trim(),
                description: item.find('p').text().trim(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: parseDate(info.shift(), 'YYYY-MM-DD'),
                category: info,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const header = $('.article-img-blk');
                header.find('img').each((_, ele) => {
                    ele = $(ele);
                    if (ele.attr('src') && ele.attr('srcset')) {
                        ele.removeAttr('srcset');
                        ele.attr('src', ele.attr('src').replace(/\/\d+c\d+\//, '/0p0/'));
                    }
                });

                item.description = header.html() + $('article .ckec').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').text(),
        link: currentUrl,
        image: $('meta[property="og:image"]').attr('content'),
        logo: $('link[rel="apple-touch-icon"]').attr('href'),
        icon: $('link[rel="apple-touch-icon"]').attr('href'),
        item: items,
    });
};
