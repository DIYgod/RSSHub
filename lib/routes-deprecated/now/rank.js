const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const sources = {
    nownews: '/home/local/player?newsId=',
    nowsports: '/home/news/details?id=',
    nowfinace: '/news/post.php?id=',
};

module.exports = async (ctx) => {
    const rootUrl = (source) => `https://${source}.now.com`;
    const currentUrl = `${rootUrl('news')}/api/getRankNewsList?pageSize=221`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const items = response.data.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.publishDate),
        description: `<img src="${item.imageUrl}">${item.summary || ''}`,
        link: `${rootUrl(item.newsSource.replace('now', ''))}${sources[item.newsSource]}${item.newsId}`,
    }));

    ctx.state.data = {
        title: '熱門 | Now 新聞',
        link: rootUrl('news'),
        item: items,
    };
};
