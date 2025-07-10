import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 40;

    const rootUrl = 'http://www.chinawriter.com.cn';
    const currentUrl = `${new URL(id ?? '', rootUrl).href}/`;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = ($('main div.inner').find('a').length === 0 ? $('body') : $('main div.inner'))
        .find('a')
        .toArray()
        .filter((item) => /(?:\/\d{4}){2}\/\w+-\w+\.html/.test($(item).prop('href')))
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            const link = item.prop('href');

            return {
                title: item.text(),
                link: link.startsWith('http') ? link : new URL(item.prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: detailResponse } = await got(item.link);

                    const content = load(detailResponse);

                    content('div.end_shared').remove();

                    const info = content('div.end_info').text().trim();

                    item.title = content('#newstit').text() || content('h6.end_tit').text();
                    item.description = content('div.end_article').html();
                    item.author = info ? info.match(/\|(.*)\d{4}/)[1].trim() : '';
                    item.category = [
                        ...new Set(
                            [
                                ...content('div.location a.clink')
                                    .slice(1)
                                    .toArray()
                                    .map((c) => content(c).text()),
                                info
                                    ? info
                                          .match(/^(.*)\|/)[1]
                                          .replaceAll('来源：', '')
                                          .trim()
                                    : undefined,
                            ].filter(Boolean)
                        ),
                    ];
                    item.pubDate = content('div.end_info em').text() ? timezone(parseDate(content('div.end_info em').text(), 'YYYY年MM月DD日HH:mm'), +8) : parseDate(content('meta[name="publishdate"]').prop('content'));
                } catch {
                    //
                }

                return item;
            })
        )
    );

    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl);

    return {
        item: items,
        title: $('title').text().replaceAll('--', ' - '),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        image: new URL($('h1.logo a img').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        allowEmpty: true,
    };
}
