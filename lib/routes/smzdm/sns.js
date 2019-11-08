const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');
const util = require('@/utils/common-utils');

module.exports = async (ctx) => {
    const id = ctx.params.id || 'zuixin';

    let link = `https://post.smzdm.com/json_more/?tab_id=${id}&filterUrl=${id}&timesort=${util.now2timestamp}&p=2`;

    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: 'https://post.smzdm.com/',
        }
    });

    const list = response.data.data;

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const pubdate = info.publish_time;
            const itemUrl = info.article_url;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            const description = $('article').html();

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: date(pubdate),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${id}-什么值得买好文分类`,
        link: link,
        item: out,
    };
};
