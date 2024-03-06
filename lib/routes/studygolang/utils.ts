import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
    linkify: true,
});

const FetchGoItems = async (ctx, rewriteId) => {
    const id = rewriteId || (ctx.req.param('id') ?? 'weekly');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const rootUrl = 'https://studygolang.com';
    const currentUrl = `${rootUrl}/go/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.right-info .title')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a');

            return {
                title: a.text(),
                link: `${rootUrl}${a.attr('href')}`,
                author: item.next().find('.author').text(),
                category: item
                    .next()
                    .find('.node')
                    .toArray()
                    .map((n) => $(n).text()),
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

                item.pubDate = timezone(parseDate(content('.timeago').first().attr('title')), +8);

                try {
                    item.description = md.render(content('.content').html());
                } catch {
                    // no-empty
                }

                return item;
            })
        )
    );

    return {
        title: `Go语言中文网 - ${$('.title h2').text()}`,
        link: currentUrl,
        item: items,
    };
};

export { FetchGoItems };
