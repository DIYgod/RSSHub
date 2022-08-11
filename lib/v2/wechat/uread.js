const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const userid = ctx.params.userid;
    const url = `http://119.29.146.143:8080/reading/subscription/account/recent?uid=${userid}`;
    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data;

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);
        return $('.rich_media_content').html();
    };

    const items = await Promise.all(
        data.data.map(async (item) => {
            const link = item.url;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: link,
            });

            const description = ProcessFeed(response.data);

            const single = {
                title: item.title,
                description,
                link,
                author: item.official_account,
                pubDate: item.publish_time,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `优读 - ${userid}`,
        link: 'https://uread.ai/',
        item: items,
    };
};
