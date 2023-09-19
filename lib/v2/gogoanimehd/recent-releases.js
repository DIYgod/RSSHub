const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = "https://gogoanimehd.io"

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);
    const recentReleases = $(".last_episodes");
    const listItems = $(recentReleases).find("li");
    const arrayOfItems = []

    for (const listItem of listItems) {
        const structuredData = {
            link: rootUrl + $(listItem).find(".name a").attr("href"),
            title: $(listItem).find(".name a").attr("title") + " - " + $(listItem).find(".episode").text(),
            description: $(listItem).find(".img a img").attr("src"),
        }
        arrayOfItems.push(structuredData)
    }

    ctx.state.data = {
        title: $('title').text(),
        link: rootUrl,
        item: arrayOfItems,
    };
};