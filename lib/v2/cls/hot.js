const got = require('@/utils/got');
const cheerio = require('cheerio');
const CryptoJS = require('crypto-js');

async function getDescription(link, ctx) {
    const description = await ctx.cache.tryGet(link, async () => {
        const detailResponse = await got({
            method: 'get',
            url: link,
        });
        const content = cheerio.load(detailResponse.data);

        return content('div.detail-content').html();
    });
    return description;
}

module.exports = async (ctx) => {
    const searchParams = new URLSearchParams({
        app: 'CailianpressWeb',
        os: 'web',
        sv: '7.7.5',
    });
    searchParams.sort();
    searchParams.append('sign', CryptoJS.MD5(CryptoJS.SHA1(searchParams.toString()).toString()).toString());

    const link = 'https://www.cls.cn/v2/article/hot/list';
    const response = await got({
        method: 'get',
        url: link,
        searchParams,
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
