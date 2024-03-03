// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const status = ['action', 'upcoming', 'recent'];

    const language = ctx.req.param('language') ?? 'en';

    let rated = ctx.req.param('rated') ?? '0';
    const category = ctx.req.param('category') ?? '0';
    const keyword = ctx.req.param('keyword') ?? '';

    rated = rated === 'active' ? 'action' : rated;
    const isStatus = status.includes(rated);

    const rootUrl = 'https://atcoder.jp';
    const currentUrl = `${rootUrl}/contests${isStatus ? `?lang=${language}` : `/archive?lang=${language}&ratedType=${rated}&category=${category}${keyword ? `&keyword=${keyword}` : ''}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $(isStatus ? `#contest-table-${rated}` : '.row')
        .find('tr')
        .slice(1, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20)
        .toArray()
        .map((item) => {
            item = $(item).find('td a').eq(1);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}?lang=${language}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content(`.lang-${language}`).html();
                item.pubDate = parseDate(content('.fixtime-full').first().text());

                return item;
            })
        )
    );

    ctx.set('data', {
        title: String(isStatus ? `${$(`#contest-table-${rated} h3`).text()} - AtCoder` : $('title').text()),
        link: currentUrl,
        item: items,
        allowEmpty: true,
    });
};
