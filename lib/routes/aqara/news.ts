// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 35;

    const rootUrl = 'https://www.aqara.cn';
    const currentUrl = new URL('news', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = response
        .match(/(parm\.newsTitle[\S\s]*?arr\.push\(parm\))/g)
        .slice(0, limit)
        .map((item) => ({
            title: item.match(/parm\.newsTitle = '(.*?)'/)[1],
            link: new URL(item.match(/parm\.contentHerf = '(\d+)'/)[1], rootUrl).href,
            pubDate: parseDate(item.match(/parm\.issueTime = '(.*?)'/)[1], 'YYYY  年  MM  月  DD  日'),
        }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('h4.fnt_56').last().text();
                item.description = content('div.news_body').html();
                item.pubDate = parseDate(content('div.news_date').first().text(), 'YYYY  年  MM  月  DD  日');

                return item;
            })
        )
    );

    const icon = $('link[rel="shortcut icon"]').prop('href').split('?')[0];

    ctx.set('data', {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        author: $('meta[name="author"]').prop('content'),
    });
};
