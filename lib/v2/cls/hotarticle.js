const got = require('@/utils/got');
const cheerio = require('cheerio');

async function getDescription(link, ctx) {
    return ctx.cache.tryGet(link, async () => {
        const detailResponse = await got({
            method: 'get',
            url: link,
        });
        const content = cheerio.load(detailResponse.data);

        return content('div.detail-content').html();
    });
}

module.exports = async (ctx) => {
    const link = 'https://www.cls.cn/v2/article/hot/list?app=CailianpressWeb&os=web&sv=7.2.2&sign=6ac194f4b3b39d45631708474e058b73';
    const response = await got({
        method: 'get',
        url: link,
    });
    const items = await Promise.all(
        response.data.data.map(async (item) => ({
            title: item.title || item.brief,
            link: `https://www.cls.cn/detail/${item.id}`,
            pubDate: new Date(item.ctime * 1000).toUTCString(),
            description: await getDescription(`https://www.cls.cn/detail/${item.id}`, ctx),
        }))
    );

    ctx.state.data = {
        title: '财联社 - 热门文章排行榜',
        link: 'https://www.cls.cn/',
        item: items,
    };
};
