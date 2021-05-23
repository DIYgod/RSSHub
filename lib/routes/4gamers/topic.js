const got = require('@/utils/got');

module.exports = async (ctx) => {
    const topic = ctx.params.topic;

    const response = await got.get(`https://www.4gamers.com.tw/site/api/news/option-cfg/${topic}?pageSize=25`);
    const list = response.data.data.results;

    ctx.state.data = {
        title: `4Gamers - ${topic}`,
        link: `https://www.4gamers.com.tw/news/option-cfg/${topic}`,
        item: list.map((item) => ({
            title: item.title,
            author: item.author.nickname,
            description: `<img src="${item.smallBannerUrl}" /><p>${item.intro}</p>`,
            pubDate: new Date(item.createPublishedAt * 1),
            link: item.canonicalUrl,
        })),
    };
};
