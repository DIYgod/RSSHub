const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const api = 'https://api.anquanke.com/data/v1/posts?size=10&page=1&category=';
    const type = ctx.params.category;
    const fulltext = ctx.params.fulltext;
    const host = 'https://www.anquanke.com';
    const res = await got(`${api}${type}`);
    const dataArray = res.data.data;

    const items = await Promise.all(dataArray.map(async (item) => {
        const art_url = `${host}/${type === 'week' ? 'week' : 'post'}/id/${item.id}`;

        const itemData = await ctx.cache.tryGet(
            art_url,
            async () => (await got(art_url)).data
        );
        const content = cheerio.load(itemData);
        const article = content('#js-article').html();

        let single = {
            title: item.title,
            description: fulltext === 'fulltext' || fulltext === 'quanwen' ? article : item.desc,
            pubDate: timezone(parseDate(item.date), +8),
            link: art_url,
            author: item.author.nickname,
        };
        return single;
    }));

    ctx.state.data = {
        title: `安全客-${dataArray[0].category_name}`,
        link: `https://www.anquanke.com/${type === 'week' ? 'week-list' : type}`,
        item: items,
    };
};
