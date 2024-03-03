// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
const { rootUrl, getCookie } = require('./utils');

export default async (ctx) => {
    const category = ctx.req.param('category') ? `${ctx.req.param('category')}/` : '';

    const currentUrl = `${rootUrl}/news/${category}`;

    const cookie = await getCookie();

    const response = await got(currentUrl, {
        headers: {
            cookie,
        },
    });
    const $ = load(response.data);

    const list = $('.div_zixun h2 a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    headers: {
                        cookie,
                    },
                });
                const content = load(detailResponse.data);

                content('h1, .intro').remove();

                item.description = content('.news').html();
                item.pubDate = timezone(parseDate(content('meta[property="og:release_date"]').attr('content')), +8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('.now').text()} - 游讯网`,
        link: currentUrl,
        item: items,
    });
};
