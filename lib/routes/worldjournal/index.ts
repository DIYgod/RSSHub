import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.worldjournal.com';

export const route: Route = {
    path: '/:path{.+}?',
    radar: [
        {
            source: ['worldjournal.com/wj/*path'],
            target: '/:path',
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
    url: 'worldjournal.com/wj/*path',
};

async function handler(ctx) {
    const { path = 'cate/breaking' } = ctx.req.param();
    const { data: response } = await got(`${baseUrl}/wj/${path}`);

    const $ = load(response);

    const list = $('.subcate-list__wrapper .subcate-list__link__text')
        .toArray()
        .map((item) => {
            item = $(item);
            const url = item.find('a').first().attr('href');
            return {
                title: item.find('h3').text(),
                description: item.find('p').html(),
                link: url.includes('?from=') ? url.split('?from=')[0] : url,
                pubDate: timezone(parseDate(item.find('.subcate-list__time--roc').text(), 'YYYY-MM-DD HH:mm'), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                $('[id^=div-gpt-ad], [class^=udn-ads-], .keywords, .next-page, .udn-ads, .article-content__ads--bd').remove();

                $('img').each((_, img) => {
                    if (img.attribs['data-src']) {
                        const url = new URL(img.attribs['data-src']);
                        if (url.pathname === '/gw/photo.php') {
                            img.attribs.src = url.searchParams.get('u');
                            delete img.attribs['data-src'];
                        }
                    }
                });

                item.description = $('.article-content__paragraph').html();
                item.categories = $('meta[name=news_keywords]').attr('content')?.split(',');

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        image: 'https://www.worldjournal.com/static/img/icons/icon-144x144.png',
        link: `${baseUrl}/wj/${path}`,
        item: items,
    };
}
