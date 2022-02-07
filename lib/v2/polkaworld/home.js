const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://pub.polkaworld.pro/articles?_sort=PublishDate:desc&_limit=10',
    });
    const docList = response.data;

    ctx.state.data = {
        title: 'PolkaWorld-资讯',
        link: 'https://www.polkaworld.org/',
        item: docList.map((item) => ({
            title: item.Title,
            description: item.Title,
            pubDate: new Date(item.PublishDate),
            author: item.author.Name,
            link: 'https://www.polkaworld.org/articles/' + item.URL,
        })),
    };
};
