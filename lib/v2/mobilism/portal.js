const got = require('@/utils/got');
const cheerio = require('cheerio');
const { toTitleCase } = require('@/utils/common-utils');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');

const get = (data) => {
    const $ = cheerio.load(data);
    const posts = $('div.span9 > section');
    const items = posts
        .map((index, item) => {
            item = $(item);
            const link = new URL(item.find('div.well > a').attr('href'), 'https://forum.mobilism.org');
            const pubDate = item.find('div.well > span.muted > em').text().replace(item.find('div.well > span.muted > em > strong').text(), '').replace(' at ', '').split(' in ')[0];
            link.searchParams.delete('sid');
            return {
                title: item.find('div.page-header > h3').text(),
                link: link.toString(),
                author: item.find('div.well > span.muted > em > strong').text().replace('Posted by: ', ''),
                description: item.find('div.well > div.postbody').text(),
                pubDate: /ago|day/.test(pubDate) ? parseRelativeDate(pubDate) : parseDate(pubDate, 'MMM D, YYYY, h:mm a'),
            };
        })
        .get();
    return items;
};

module.exports = async (ctx) => {
    const { type, fulltext } = ctx.params;
    const url = `https://forum.mobilism.org/portal.php?mode=articles&block=${type}&sk=t&sd=d&start=0`;
    const response = await got(url);
    const list = get(response.data);
    let items;
    if (fulltext === 'y') {
        items = await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got(item.link);
                    const content = cheerio.load(detailResponse.data);
                    item.description = content('div.content').html();
                    return item;
                })
            )
        );
    } else {
        items = list;
    }

    ctx.state.data = {
        title: `Mobilism Portal ${toTitleCase(type)} Release`,
        link: url,
        description: `Mobilism Portal ${toTitleCase(type)} RSS`,
        item: items,
    };
};
