const got = require('@/utils/got');
const cheerio = require('cheerio');

const url = 'http://feed.sina.com.cn/api/roll/get?pageid=402&lid=2559&num=20&versionNumber=1.2.8&page=1&encode=utf-8';

module.exports = async (ctx) => {
    const response = await got.get(url);
    const list = response.data.result.data;

    const out = await Promise.all(
        list.map(async (data) => {
            const title = data.title;
            const date = data.intime * 1000;
            const link = data.url;

            const description = await ctx.cache.tryGet(`sina-chuangshiji: ${link}`, async () => {
                const response = await got.get(link);
                const $ = cheerio.load(response.data);

                return $('.blkContainerSblkCon').html();
            });

            const single = {
                title: title,
                link: link,
                description: description,
                pubDate: new Date(date).toUTCString(),
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '新浪专栏-创事记',
        link: 'https://tech.sina.com.cn/chuangshiji',
        item: out,
    };
};
