// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const typeMap = {
    0: '9004748',
    1: '9004749',
    2: '9213612',
    3: '8314815',
    4: '9222707',
};

/**
 *
 * @param ctx {import('koa').Context}
 */
export default async (ctx) => {
    const type = ctx.req.param('type');
    const url = `https://help.aliyun.com/noticelist/${typeMap[type] || typeMap[0]}.html`;
    const response = await got({ method: 'get', url });
    const $ = load(response.data);
    const list = $('ul > li.notice-li')
        .map((i, e) => {
            const element = $(e);
            const title = element.find('a').text().trim();
            const link = 'https://help.aliyun.com' + element.find('a').attr('href').trim();
            const date = element.find('.y-right').text();
            const pubDate = timezone(parseDate(date), +8);
            return {
                title,
                description: '',
                link,
                pubDate,
            };
        })
        .get();

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const itemReponse = await got(item.link);
                const itemElement = load(itemReponse.data);
                item.description = itemElement('#se-knowledge').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text().trim(),
        link: url,
        item: result,
    });
};
