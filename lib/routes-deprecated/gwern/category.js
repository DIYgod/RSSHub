const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const name = category.charAt(0).toUpperCase() + category.slice(1);
    const baseURL = `https://www.gwern.net`;
    const url = baseURL + `/index`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $(`section#${category} ul > li`).get();

    const out = await Promise.all(
        list.map(async (item) => {
            const grasp = cheerio.load(item);
            const link = baseURL + grasp('a').attr('href');
            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }
            const res = await got.get(link);
            const $ = cheerio.load(res.data);

            const title = $('header > h1').text();
            const time = $('span#page-creation').text();
            // const modified = $('span#page-modified').text();

            $('a').each((index, item) => {
                item = $(item);
                item.removeAttr('data-popup-title');
                item.removeAttr('data-popup-title-html');
                item.removeAttr('data-popup-author');
                item.removeAttr('data-popup-abstract');
                item.removeAttr('data-popup-doi');
                item.removeAttr('data-popup-date');
            });
            $;

            const contents = $('div#markdownBody').html().replace('&shy;', '');

            const single = {
                title,
                author: 'Gwern Bran­wen',
                description: contents,
                link,
                guid: link,
                pubDate: new Date(time).toUTCString(),
            };
            ctx.cache.set(link, JSON.stringify(single));
            return single;
        })
    );
    ctx.state.data = {
        title: `Gwern - ${name}`,
        link: url,
        item: out,
    };
};
