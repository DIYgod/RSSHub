// @ts-nocheck
import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    let thePath = getSubPath(ctx).replace(/^\//, '');

    if (/^f\d+-\d+/.test(thePath)) {
        thePath = `fid=${thePath.match(/^f(\d+)-\d+/)[1]}`;
    }

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://keylol.com';
    const currentUrl = new URL(`forum.php?mod=forumdisplay&${thePath.replaceAll(/mod=\w+&/g, '')}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('a.xst')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.prop('href').split('&extra=')[0], rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.description = content('td.t_f').html();
                item.author = content('a.xw1').first().text();
                item.category = content('#keyloL_thread_tags a')
                    .toArray()
                    .map((c) => content(c).text());

                const pubDateEm = content('img.authicn').first().next();
                const pubDateText = pubDateEm.find('span').prop('title') ?? pubDateEm.text();
                const pubDateMatches = pubDateText.match(/(\d{4}(?:-\d{1,2}){2} (?:\d{2}:){2}\d{2})/) ?? undefined;
                if (pubDateMatches) {
                    item.pubDate = timezone(parseDate(pubDateMatches[1], 'YYYY-M-D HH:mm:ss'), +8);
                }

                const updatedMatches =
                    content('i.pstatus')
                        .text()
                        .match(/(\d{4}(?:-\d{1,2}){2} (?:\d{2}:){2}\d{2})/) ?? undefined;
                if (updatedMatches) {
                    item.updated = timezone(parseDate(updatedMatches[1], 'YYYY-M-D HH:mm:ss'), +8);
                }

                item.comments = content('div.subforum_right_title_left_down').text() ? Number.parseInt(content('div.subforum_right_title_left_down').text(), 10) : 0;

                return item;
            })
        )
    );

    const icon = $('link[rel="apple-touch-icon"]').prop('href');

    ctx.set('data', {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        icon,
        logo: icon,
        subtitle: $('meta[name="application-name"]').prop('content'),
        author: $('meta[name="author"]').prop('content'),
    });
};
