import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const params = getSubPath(ctx);

    const rootUrl = 'https://www.dgjyw.com';
    const currentUrl = `${rootUrl}${params === '/' ? '/tz' : params}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = load(response.data);

    let items = $('div.text-list ul li a')
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: `${link.startsWith('http') ? '' : `${rootUrl}/`}${link}`,
                pubDate: parseDate(item.next().text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (/dgjyw\.com/.test(item.link)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                        https: {
                            rejectUnauthorized: false,
                        },
                    });

                    const content = load(detailResponse.data);

                    content('.cont-tit').remove();
                    content('.art-body').html(content('.v_news_content').html());

                    item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').attr('content')), +8);
                    item.description = content('form[name="_newscontent_fromname"]').html();
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
