const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.nytimes.com';
    const currentUrl = `${rootUrl}/zh-hans/series/daily-briefing-chinese`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const listData = JSON.parse(response.data.match(/"initialState":(.*),"config"/)[1]);

    let items = [];
    Object.keys(listData).forEach((key) => {
        if (/^Article:/.test(key) && listData[key].url) {
            const item = listData[key];
            items.push({
                link: item.url,
                pubDate: parseDate(item.firstPublished),
            });
        }
    });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                // to remove ads
                content('.StoryBodyCompanionColumn').last().find('p').last().remove();

                const images = detailResponse.data.match(/"url":"[^{}]+","name":"articleLarge"/g).map((e) => JSON.parse(`{${e}}`).url);

                let i = 0;
                content('figure').each(function () {
                    content(this).html(
                        art(path.join(__dirname, 'templates/image.art'), {
                            url: images[i++],
                        })
                    );
                });

                item.title = content('meta[property="og:title"]').attr('content');
                item.author = content('meta[name="byl"]').attr('content').replace(/By /, '');
                item.description = content('section[name="articleBody"]').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '新闻简报 - The New York Times',
        link: currentUrl,
        item: items,
    };
};
