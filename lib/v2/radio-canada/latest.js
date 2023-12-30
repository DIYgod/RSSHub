const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const language = ctx.params.language ?? 'en';

    const rootUrl = 'https://ici.radio-canada.ca';
    const apiRootUrl = 'https://services.radio-canada.ca';
    const currentUrl = `${apiRootUrl}/neuro/sphere/v1/rci/${language}/continuous-feed?pageSize=50`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.data.lineup.items.map((item) => ({
        title: item.title,
        category: item.kicker,
        link: `${rootUrl}${item.url}`,
        pubDate: parseDate(item.date),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = cheerio.load(detailResponse.data);
                const rcState = $('script:contains("window._rcState_ = JSON.parse")')
                    .text()
                    .match(/JSON\.parse\((".*")\);/)[1];
                const rcStateJson = JSON.parse(JSON.parse(rcState));
                const news = Object.values(rcStateJson.pagesV2.pages)[0];
                item.description = news.data.newsStory.body.html.replace(/\\n/g, '<br>');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: response.data.meta.title,
        link: response.data.metric.metrikContent.omniture.url,
        item: items,
    };
};
