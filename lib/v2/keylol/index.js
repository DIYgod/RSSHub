const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    let thePath = ctx.path.replace(/^\//, '');

    if (/^f\d+-\d+/.test(thePath)) {
        thePath = `fid=${thePath.match(/^f(\d+)-\d+/)[1]}`;
    }

    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30;

    const rootUrl = 'https://keylol.com';
    const currentUrl = new URL(`forum.php?mod=forumdisplay&${thePath.replace(/mod=\w+&/g, '')}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

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
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                item.description = content('td.t_f').html();
                item.author = content('a.xw1').first().text();
                item.category = content('#keyloL_thread_tags a')
                    .toArray()
                    .map((c) => content(c).text());

                const pubDateEm = content('img.authicn').first().next();
                const pubDateText = pubDateEm.find('span').prop('title') ?? pubDateEm.text();
                const pubDateMatches = pubDateText.match(/(\d{4}-\d{1,2}-\d{1,2} \d{2}:\d{2}:\d{2})/) ?? undefined;
                if (pubDateMatches) {
                    item.pubDate = timezone(parseDate(pubDateMatches[1], 'YYYY-M-D HH:mm:ss'), +8);
                }

                const updatedMatches =
                    content('i.pstatus')
                        .text()
                        .match(/(\d{4}-\d{1,2}-\d{1,2} \d{2}:\d{2}:\d{2})/) ?? undefined;
                if (updatedMatches) {
                    item.updated = timezone(parseDate(updatedMatches[1], 'YYYY-M-D HH:mm:ss'), +8);
                }

                item.comments = content('div.subforum_right_title_left_down').text() ? parseInt(content('div.subforum_right_title_left_down').text(), 10) : 0;

                return item;
            })
        )
    );

    const icon = $('link[rel="apple-touch-icon"]').prop('href');

    ctx.state.data = {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        icon,
        logo: icon,
        subtitle: $('meta[name="application-name"]').prop('content'),
        author: $('meta[name="author"]').prop('content'),
    };
};
