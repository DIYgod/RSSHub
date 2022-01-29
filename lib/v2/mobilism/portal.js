const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const timezone = require('@/utils/timezone');
const dayjs = require('dayjs');

const get = (data) => {
    const $ = cheerio.load(data);
    const posts = $('div.span9 > section');
    const items = posts
        .map((index, item) => {
            item = $(item);
            const pubDate = timezone(dayjs(item.find('div.well > span.muted > em').text().replace(item.find('div.well > span.muted > em > strong').text(), '').replace(' at ', '').substring(0, 18), 'DD MMM YYYY, HH:mm').toDate(), 0);
            return {
                title: item.find('div.page-header > h3').text(),
                link: new URL(item.find('div.well > a').attr('href'), 'https://forum.mobilism.org').toString(),
                author: item.find('div.well > span.muted > em > strong').text().replace('Posted by: ', ''),
                description: item.find('div.well > div.postbody').text(),
                pubDate,
            };
        })
        .get();
    return items;
};

module.exports = async (ctx) => {
    const { type, fulltext } = ctx.params;
    const url = `https://forum.mobilism.org/portal.php?mode=articles&block=${type}&sk=t&sd=d&start=0`;
    const response = await got.get(url, {
        headers: {
            cookie: await utils.login(),
        },
    });
    const list = get(response.data);
    let items;
    if (fulltext === 'y') {
        items = await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got.get(item.link);
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
        title: `Mobilism Portal ${utils.firstUpperCase(type)} Release`,
        link: url,
        description: `Mobilism Portal ${utils.firstUpperCase(type)} RSS`,
        item: items,
    };
};
