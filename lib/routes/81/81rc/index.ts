// @ts-nocheck
import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const thePath = getSubPath(ctx).replace(/^\/81rc/, '');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://81rc.81.cn';

    // The default is http://81rc.81.cn/sy/gzdt_210283.
    const currentUrl = new URL(thePath || '/sy/gzdt_210283', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.left-news ul li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.prop('href'), rootUrl).href,
                pubDate: timezone(parseDate(item.parent().find('span').text()), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.description = content('.txt').html();
                item.author = content('meta[name="reporter"]').prop('content') || content('meta[name="author"]').prop('content');

                return item;
            })
        )
    );

    const icon = $('link[rel="icon"]').prop('href');

    ctx.set('data', {
        item: items,
        title: `军队人才网 - ${$('div.left-word')
            .find('a')
            .toArray()
            .map((a) => $(a).text())
            .filter((a) => a !== '首页')
            .join(' - ')}`,
        link: currentUrl,
        language: 'zh-cn',
        icon,
        logo: icon,
    });
};
