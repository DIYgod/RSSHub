// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const host = 'https://firecore.com/releases';
    const { data } = await got(host);
    const $ = load(data);
    const items = $(`div.tab-pane.fade#${ctx.req.param('os')}`)
        .find('.release-date')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item
                .parent()
                .contents()
                .filter((_, el) => el.nodeType === 3)
                .text();
            const pubDate = parseDate(item.text().match(/(\d{4}-\d{2}-\d{2})/)[1]);

            const next = item.parent().nextUntil('hr');
            return {
                title,
                description: next
                    .toArray()
                    .map((item) => $(item).html())
                    .join(''),
                pubDate,
            };
        });

    ctx.set('data', {
        title: `Infuse Release Notes (${ctx.req.param('os')})`,
        link: 'https://firecore.com/releases',
        item: items,
    });
};
