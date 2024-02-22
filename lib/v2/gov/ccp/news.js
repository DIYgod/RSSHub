const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'zxfb';

    const rootUrl = 'https://www.12371.cn/';
    const currentUrl = `${rootUrl}/${category}/`;
    const response = await got(currentUrl);

    const $ = cheerio.load(response.data);

    const pattern = /item=\[({[\S\s]*?})];/m;
    const matches = pattern.exec(response.data);
    let news_list = {};
    if (matches && matches.length > 1) {
        let jsonString = matches[1].replaceAll('"', '&quto;');
        jsonString = jsonString.replaceAll("'", '"');
        // console.log(jsonString);
        news_list = JSON.parse('[' + jsonString + ']');
        // console.log(items);
    }

    const top_news_list = news_list.slice(0, 15);
    // console.log(top_news_list)

    const items = await Promise.all(
        top_news_list.map((item) =>
            ctx.cache.tryGet(item.link_add, async () => {
                const detailResponse = await got(item.link_add);
                const content = cheerio.load(detailResponse.data);

                item.link = item.link_add;
                item.description = content('#font_area').text();
                item.pubDate = item.brief;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
