const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://research.samsung.com';
    const currentUrl = `${rootUrl}/blogMain/list.json`;

    const response = await got({
        method: 'post',
        url: currentUrl,
        json: {
            currentPageNo: 0,
            endIndex: 9,
            startIndex: 0,
        },
    });

    let items = response.data.value.map((item) => ({
        title: item.title,
        author: item.authorName,
        link: `${rootUrl}${item.urlLink}`,
        category: [item.catagoryCode, item.hashTag1, item.hashTag2],
        pubDate: parseDate(item.publicationDtsStr.replace(/On /, ''), 'MMMM D, YYYY'),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.news-con').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'BLOG | Samsung Research',
        link: `${rootUrl}/blog`,
        item: items,
    };
};
