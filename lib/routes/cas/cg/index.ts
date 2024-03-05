// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const caty = ctx.req.param('caty') || 'zh';

    const rootUrl = 'https://www.cas.cn';
    const currentUrl = `${rootUrl}/cg/${caty}/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    const list = $('#content li')
        .not('.gl_line')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: `${rootUrl}/cg/${caty}${a.attr('href').replace('.', '')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.description = content('.TRS_Editor').html();
                item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').attr('content')), 8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text().replace('----', ' - '),
        link: currentUrl,
        item: items,
    });
};
