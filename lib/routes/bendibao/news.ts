import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';

export default async (ctx) => {
    const city = ctx.req.param('city');
    if (!isValidHost(city)) {
        throw new Error('Invalid city');
    }

    const rootUrl = `http://${city}.bendibao.com`;

    let response = await got({
        method: 'get',
        url: rootUrl,
    });

    let $ = load(response.data);
    const title =
        $('title')
            .text()
            .replace(/-爱上本地宝，生活会更好/, '') + `焦点资讯`;

    let items = $('ul.focus-news li')
        .toArray()
        .map((item) => {
            item = $(item).find('a');

            const link = item.attr('href');

            return {
                title: item.text(),
                link: link.indexOf('http') === 0 ? link : `${rootUrl}${link}`,
            };
        });

    // Cities share 2 sets of ui.
    //
    // eg1. http://bj.bendibao.com/
    // eg2. http://kel.bendibao.com/
    //
    // Go to /news to fetch data for the eg2 case.

    if (!items.length) {
        response = await got({
            method: 'get',
            url: `http://${city}.bendibao.com/news`,
        });

        $ = load(response.data);

        items = $('#listNewsTimeLy div.info')
            .toArray()
            .map((item) => {
                item = $(item).find('a');

                const link = item.attr('href');

                return {
                    title: item.text(),
                    link: link.indexOf('http') === 0 ? link : `${rootUrl}${link}`,
                };
            });
    }

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    // Some links lead to mobile-view pages.
                    // eg. http://m.bj.bendibao.com/news/273517.html
                    // Divs for contents are different from which in desktop-view pages.

                    item.description = content('div.content').html() ?? content('div.content-box').html();

                    // Spans for publish dates are the same cases as above.

                    item.pubDate = timezone(
                        parseDate(
                            content('span.time')
                                .text()
                                .replace(/发布时间：/, '') ?? content('span.public_time').text()
                        ),
                        +8
                    );

                    return item;
                } catch {
                    return '';
                }
            })
        )
    );

    ctx.set('data', {
        title,
        link: rootUrl,
        item: items,
    });
};
