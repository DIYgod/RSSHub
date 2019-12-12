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
        return $('.container .post-content').html();
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('.article-title > a');
            const link = baseUrl + $a.attr('href');
            // const publish_time = $('.date-label').text();

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
                title: $a.text(),
                description,
                link: link,
                // pubDate: publish_time,
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
