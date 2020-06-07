const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `https://www.cls.cn/depth`;
    const response = await got({
        method: 'get',
        url: link,
    });

    const data = JSON.parse(response.data.match(/"depth":(.*?),"reference":/)[1]);

    const list = data.dataList.map((item) => ({
        title: item.title,
        link: `https://www.cls.cn/depth/${item.article_id}`,
        pubDate: new Date(item.ctime * 1000).toUTCString(),
    }));

    ctx.state.data = {
        title: `财联社 - 深度`,
        link: link,
        item: await Promise.all(
            list.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const contentResponse = await got({ method: 'get', url: item.link });
                        const content = cheerio.load(contentResponse.data);
                        item.description = content('div.thisContent').html();
                        return item;
                    })
            )
        ),
    };
};
