import { Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

import shortcuts from './shortcuts';

export const route: Route = {
    path: '/nsfc/*',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    let thePath = getSubPath(ctx).replace(/^\/nsfc/, '');

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const shortcutMatches = thePath.match(/(\/news)?\/([\w-]+)/);

    if (shortcutMatches) {
        const shortcut = shortcutMatches[2];
        if (Object.hasOwn(shortcuts, shortcut)) {
            thePath = shortcuts[shortcut];
        }
    }

    const rootUrl = 'https://www.nsfc.gov.cn';
    const currentUrl = new URL((/\/more$/.test(thePath) ? `${thePath}.htm` : thePath) || 'publish/portal0/tab442/', rootUrl).href;

    const { data: response } = await got(currentUrl, {
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = load(response);

    let items = $('span.fl a, ul.dp_lia li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.prop('title') ?? item.text(),
                link: new URL(item.prop('href'), rootUrl).href,
                guid: `nsfc-${item.prop('id')}`,
                pubDate: parseDate(item.next().text().replace(/\[]/g, '', ['YYYY-MM-DD', 'YY-MM-DD'])),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link, {
                    https: {
                        rejectUnauthorized: false,
                    },
                });

                const content = load(detailResponse);

                item.title = content('div.title_xilan').text();
                item.description = content('#zoom').html();
                item.author = content('meta[name="docauthor"]').prop('content');
                item.category = [content('meta[name="channel"]').prop('content'), content('meta[name="docsource"]').prop('content')];
                item.pubDate = parseDate(
                    content('div.line_xilan')
                        .text()
                        .match(/日期 (\d{4}-\d{2}-\d{2})/)[1]
                );

                return item;
            })
        )
    );

    return {
        item: items,
        title: `国家自然科学基金委员会 - ${$('#ess_essBREADCRUMB_lblBreadCrumb a.break')
            .toArray()
            .slice(1)
            .map((a) => $(a).text())
            .join(' - ')}`,
        link: currentUrl,
        description: $('meta[name="DESCRIPTION"]').prop('content'),
        language: 'zh-cn',
        subtitle: $('meta[name="KEYWORDS"]').prop('content'),
        author: $('meta[name="AUTHOR"]').prop('content'),
    };
}
