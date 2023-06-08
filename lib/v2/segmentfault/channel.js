const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://segmentfault.com';

module.exports = async (ctx) => {
    const name = ctx.params.name;

    const link = `${host}/channel/${name}`;
    const response = await got(link);
    const $ = cheerio.load(response.data);

    const channel_name = $('#leftNav > a.active').text();

    const list = $('ul.bg-transparent.list-group.list-group-flush > li')
        .slice(0, 10)
        .map((_, item) => ({
            link: new URL($(item).find('div.content > h3.h5 > a').attr('href'), host).href,
            title: $(item).find('div.content > h3.h5 > a').text(),
            author: $(item).find('span.name').text(),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.description = content('article')
                    .html()
                    .replace(/data-src="/g, `src="${host}`);
                item.pubDate = parseDate(content('time').attr('datetime'));

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `segmentfault - ${channel_name}`,
        link,
        item: items,
    };
};
