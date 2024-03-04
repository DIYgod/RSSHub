// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const journal = ctx.req.param('journal') ?? 'acta-chiropterologica';

    const rootUrl = 'https://bioone.org';
    const currentUrl = `${rootUrl}/journals/${journal}/current`;
    const response = await got(currentUrl, {
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = load(response.data);

    let items = $('.TOCLineItemBoldText')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20)
        .toArray()
        .map((item) => {
            item = $(item).parent();

            return {
                link: `${rootUrl}${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    https: {
                        rejectUnauthorized: false,
                    },
                });

                const content = load(detailResponse.data);

                content('.ProceedingsArticleOpenAccessPanel').remove();
                content('#divNotSignedSection, #rightRail').remove();

                item.description = content('.panel-body').html();
                item.title = content('meta[name="dc.Title"]').attr('content');
                item.author = content('meta[name="dc.Creator"]').attr('content');
                item.doi = content('meta[name="dc.Identifier"]').attr('content');
                item.pubDate = parseDate(content('meta[name="dc.Date"]').attr('content'));

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('.panel-body .row a').first().text()} - BioOne`,
        description: $('.panel-body .row text').first().text(),
        link: currentUrl,
        item: items,
    });
};
