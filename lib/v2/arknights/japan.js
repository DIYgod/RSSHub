const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.arknights.jp:10014/news?lang=ja&limit=9&page=1',
    });

    const items = response.data.data.items;
    const newsList = items.map((item) => ({
        title: item.title,
        description: item.content[0].value,
        pubDate: parseDate(item.publishedAt),
        link: `https://www.arknights.jp/news/${item.id}`,
    }));

    ctx.state.data = {
        title: 'アークナイツ',
        link: 'https://www.arknights.jp/news',
        description: 'アークナイツ ニュース',
        language: 'ja',
        item: newsList,
    };
};
