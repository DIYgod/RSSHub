const got = require('@/utils/got');
const date = require('@/utils/date');
const cheerio = require('cheerio');
const { addNoReferrer } = require('@/utils/common-utils');

module.exports = async (ctx) => {
    const channel = ctx.params.name;
    const pageUrl = `https://m.21jingji.com/channel/${channel}`;

    const response = await got({
        method: 'get',
        url: pageUrl,
    });

    const $ = cheerio.load(response.data);
    const channelName = $(`div.nav a[href='/channel/${channel}']`).text();
    const list = $('div.news_list>a')
        .slice(0, 5)
        .map((i, e) => $(e).attr('href'))
        .get();

    const out = await Promise.all(
        list.map(async (link) => {
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: link,
                headers: {
                    Referer: pageUrl,
                },
            });

            const $ = cheerio.load(response.data);

            const div = $('div.editor');
            if (div) {
                div.remove();
            }

            const title = $('h1').text();
            const dateStr = $('div.newsDate').text();

            addNoReferrer($, 'div.txtContent img', 'data-original');

            const content = $('div.txtContent').html();

            const single = {
                pubDate: date(dateStr),
                link: link,
                title: title,
                description: content,
            };

            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '21财经-' + channelName,
        link: pageUrl,
        description: '21财经-' + channelName,
        item: out,
    };
};
