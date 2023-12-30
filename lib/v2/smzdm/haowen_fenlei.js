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
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h2.item-name a').text(),
                link: item.find('h2.item-name a').attr('href'),
                description: item.find('.item-info').html(),
                author: item.find('.nickname').text(),
                pubDate: timezone(parseDate(item.find('span.time').text(), ['HH:mm', 'MM-DD HH:mm', 'YYYY-MM-DD HH:mm']), 8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const response = await got(item.link);
                    const $ = cheerio.load(response.data);
                    item.description = $('article').html();
                    item.pubDate = timezone(parseDate($('meta[property="og:release_date"]').attr('content')), 8);
                    item.author = $('meta[property="og:author"]').attr('content');
                } catch (err) {
                    // 404
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${title}- 什么值得买好文分类`,
        link,
        item: out,
    };
};
