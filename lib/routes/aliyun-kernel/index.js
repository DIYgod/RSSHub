const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://kernel.taobao.org/';
    const response = await got({
        method: 'get',
        url: baseUrl,
        headers: {
            Referer: baseUrl,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.container .post-item').get();
    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        // 提取内容
        return {
            desc: $('.container .post-content').html(),
            publish_time: $('.post-meta > time').attr('datetime'),
        };
    };
    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('.article-title > a');
            const link = baseUrl + $a.attr('href');
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: link,
            });
            const feed = ProcessFeed(response.data);
            const description = feed.desc;
            const pubDate = feed.publish_time;

            const single = {
                title: $a.text(),
                description,
                link: link,
                pubDate: pubDate,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'Kernel Aliyun',
        link: baseUrl,
        item: items,
    };
};
