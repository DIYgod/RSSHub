const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const categories = {
    tracker: 123,
    feature: 124,
    opinion: 125,
};

module.exports = async (ctx) => {
    const category = ctx.params.category || '';
    const id = ctx.params.id || '';

    const rootUrl = 'https://news.now.com';

    let currentUrl = '';
    if (categories.hasOwnProperty(category)) {
        currentUrl = `${rootUrl}/home/${category}/detail?catCode=${categories[category]}&topicId=${id}`;
    } else {
        currentUrl = `${rootUrl}/home${category ? `/${category}` : ''}`;
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $(`${category === '' ? '.homeFeaturedNews ' : '.newsCategoryColLeft '}.newsTitle`)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.parent().parent().attr('href')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                const images = detailResponse.data.match(/"imageUrl":"(.*?)","image2Url":/);

                item.pubDate = parseDate(content('.published').attr('datetime'));
                item.description = (images ? `<img src="${images[1]}">` : '') + content('.newsLeading').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: String(categories.hasOwnProperty(category) ? $('title').text() : ($('.smallSpace.active').text() || '首頁') + ' | Now 新聞'),
        link: currentUrl,
        item: items,
    };
};
