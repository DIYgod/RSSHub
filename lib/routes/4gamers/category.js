const got = require('@/utils/got');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    const response = await got.get(`https://www.4gamers.com.tw/site/api/news/by-category/${category}?pageSize=25`);
    const list = response.data.data.results;

    ctx.state.data = {
        title: `4Gamers - ${list[0].category.name}`,
        link: `https://www.4gamers.com.tw/news/category/${category}/`,
        item: list.map((item) => ({
            title: item.title,
            author: item.author.nickname,
            description: `<img src="${item.smallBannerUrl}" /><p>${item.intro}</p>`,
            pubDate: new Date(item.createPublishedAt * 1),
            link: item.canonicalUrl,
        })),
    };
};
