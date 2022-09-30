const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://segmentfault.com';

module.exports = async (ctx) => {
    const tag = ctx.params.tag;
    const apiURL = `https://segmentfault.com/gateway/tag/${tag}/articles?loadMoreType=pagination&initData=true&page=1&sort=newest&pageSize=30`;
    const response = await got(apiURL);
    const data = response.data.rows;

    const list = data.map((item) => ({
        title: item.title,
        link: new URL(item.url, host).href,
        author: item.user.name,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const content = cheerio.load(response.data);

                item.description = content('article').html();
                item.pubDate = parseDate(content('time').attr('datetime'));

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `segmentfault-Blogs-${tag}`,
        link: `${host}/t/${tag}/blogs`,
        item: items,
    };
};
