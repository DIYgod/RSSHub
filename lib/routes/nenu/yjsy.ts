// @ts-nocheck
import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10;

    const path = getSubPath(ctx) === '/yjsy' ? '/tzgg' : getSubPath(ctx).replace(/^\/yjsy/, '');

    const rootUrl = 'https://yjsy.nenu.edu.cn';
    const currentUrl = `${rootUrl}${path}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('a.tit')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: link.startsWith('http') ? link : new URL(link, rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (/yjsy\.nenu\.edu\.cn/.test(item.link)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    item.title = content('h2').text();
                    item.description = content('.v_news_content').html();
                    item.pubDate = parseDate(
                        content('h3')
                            .text()
                            .match(/(\d{4}-\d{2}-\d{2})/)[1]
                    );
                }

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
