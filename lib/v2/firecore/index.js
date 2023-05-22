const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const host = 'https://firecore.com/releases';
    const { data } = await got(host);
    const $ = cheerio.load(data);
    const items = $(`div.tab-pane.fade#${ctx.params.os}`)
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

    ctx.state.data = {
        title: `Infuse Release Notes (${ctx.params.os})`,
        link: 'https://firecore.com/releases',
        item: items,
    };
};
