const got = require('@/utils/got');
const cheerio = require('cheerio');

const category = {
    default: '最新文章',
    fresh: '行业快讯',
    industry: '行业观察',
    talk: '镁客请讲',
    intech: '硬科技100人',
    investor: '投融界',
    everything: '万象',
};

module.exports = async (ctx) => {
    let host = 'https://www.im2maker.com';

    let channel = 'default';
    if (ctx.params.channel) {
        channel = ctx.params.channel.toLowerCase();
        host = `${host}/category/${channel}`;
    }
    const titleCategory = category[channel];

    const response = await got.get(host);

    const $ = cheerio.load(response.data);
    const hrefs = $("a[class='title info_flow_news_title']")
        .map((i, e) => e.attribs.href)
        .get();

    const out = await Promise.all(
        hrefs.map(async (itemUrl) => {
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);

            const item = {
                title: $('title').text(),
                link: itemUrl,
                author: $('.single-post-header-meta .author .name').text(),
                description: $('.article').html(),
                pubDate: $('.single-post-header-meta .author .item').text(),
            };

            ctx.cache.set(itemUrl, JSON.stringify(item));
            return item;
        })
    );

    ctx.state.data = {
        title: `镁客网 ${titleCategory}`,
        link: host,
        description: '镁客网',
        item: out,
    };
};
