const got = require('@/utils/got');

module.exports = async (ctx) => {
    const resp = await got({
        method: 'get',
        url: 'https://pub.polkaworld.pro/articles?_sort=PublishDate:desc&_start=0&_limit=100',
        headers: {
            Referer: 'https://www.polkaworld.org/',
        },
    });
    const data = resp.data;
    ctx.state.data = {
        title: 'PolkaWorld 最新',
        link: 'https://www.polkaworld.org/',
        item: data.map((val) => ({
            title: val.Title,
            link: `https://www.polkaworld.org/articles/${val.URL}`,
            description: val.Content,
            pubDate: val.PublishDate,
        })),
    };
};
