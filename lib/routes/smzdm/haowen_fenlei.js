const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
module.exports = async (ctx) => {
    const name = ctx.params.name;
    const sort = ctx.params.sort || '0';

    let link;
    if (sort === '0') {
        link = `https://post.smzdm.com/fenlei/${name}/`;
    } else {
        link = `https://post.smzdm.com/fenlei/${name}/hot_${sort}/`;
    }

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const title = $('div.crumbs.nav-crumbs').text().split('>').pop();

    const list = $('div.list.post-list')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('h2.item-name a').text(),
                link: $(this).find('h2.item-name a').attr('href'),
                pubdate: $(this).find('span.time').text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const pubdate = info.pubdate;
            const itemUrl = info.link;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const description = $('article').html();

            const single = {
                title,
                link: itemUrl,
                description,
                pubDate: timezone(parseDate(pubdate, 'H:mm'), +8),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${title}-什么值得买好文分类`,
        link,
        item: out,
    };
};
