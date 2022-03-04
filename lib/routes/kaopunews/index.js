const got = require('@/utils/got');

module.exports = async (ctx) => {
    const language = ctx.params.language || '';

    const rootUrl = 'https://kaopu.news';
    const currentUrl = `${rootUrl}/${language === 'zh-hant' ? 'zh-hant' : 'index'}.html`;
    const apiUrl = `https://kaopucdn.azureedge.net/jsondata/news_han${language === 'zh-hant' ? 't' : 's'}_0.json`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.map((item) => ({
        link: item.link,
        title: item.title,
        author: item.publisher,
        pubDate: new Date(item.first_seen * 1000),
        description: `<p>${item.story_summary}</p>`,
    }));

    ctx.state.data = {
        title: language === 'zh-hant' ? '靠譜新聞' : '靠谱新闻',
        link: currentUrl,
        item: items,
    };
};
