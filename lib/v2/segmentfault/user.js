const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://segmentfault.com';

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const apiURL = `https://segmentfault.com/gateway/homepage/${name}/timeline?size=20&offset=`;

    const response = await got(apiURL);
    const data = response.data.rows;

    const author = data[0].user.name;
    const list = data.map((item) => ({
        title: item.title,
        description: item.excerpt,
        link: new URL(item.url, host).href,
        author,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const content = cheerio.load(response.data);

                item.description = content('article')
                    .html()
                    .replace(/data-src="/g, `src="${host}`);
                item.pubDate = parseDate(content('time').attr('datetime'));

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `segmentfault - ${author}`,
        link: `${host}/u/${name}`,
        item: items,
    };
};
