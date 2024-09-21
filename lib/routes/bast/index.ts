import { Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '*',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const colPath = getSubPath(ctx).replace(/^\//, '') || '32942';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const rootUrl = 'https://www.bast.net.cn';
    const currentUrl = `${rootUrl}/${isNaN(colPath) ? colPath : `col/col${colPath}`}/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let $ = load(response.data);

    $('.list-title-bif').remove();

    const title = $('title').text();
    let selection = $('a[title]');

    if (selection.length === 0) {
        $ = load($('ul.cont-list div script').first().text());

        $('.list-title-bif').remove();

        selection = $('a[title]');
    }

    let items = selection
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text().trim(),
                link: item.attr('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (/bast\.net\.cn/.test(item.link)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    item.title = content('meta[name="ArticleTitle"]').attr('content');
                    item.author = content('meta[name="contentSource"]').attr('content');
                    item.pubDate = timezone(parseDate(content('meta[name="pubdate"]').attr('content')), +8);
                    item.category = [content('meta[name="ColumnName"]').attr('content')];

                    item.description = content('.arccont').html();
                }

                return item;
            })
        )
    );

    return {
        title,
        link: currentUrl,
        item: items,
    };
}
