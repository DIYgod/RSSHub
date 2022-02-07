const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;
    const response = await got({
        method: 'get',
        url: 'https://pub.polkaworld.pro/articles?_sort=PublishDate:desc&_limit=' + limit,
    });
    const docList = response.data;

    ctx.state.data = {
        title: 'PolkaWorld-资讯',
        link: 'https://www.polkaworld.org/',
        item: docList.map((item) => ({
            title: item.Title,
            description: item.Title,
            pubDate: parseDate(item.PublishDate),
            author: item.author.Name,
            link: 'https://www.polkaworld.org/articles/' + item.URL,
        })),
    };
};
