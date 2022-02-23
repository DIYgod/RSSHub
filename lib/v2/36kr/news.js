const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const links = {
    latest: 'information/web_news',
    recommend: 'information/web_recommend',
    life: 'information/happy_life',
    estate: 'information/real_estate',
    workplace: 'information/web_zhichang',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'latest';

    const rootUrl = 'https://36kr.com';
    const currentUrl = `${rootUrl}/${links.hasOwnProperty(category) ? links[category] : `information/${category}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = JSON.parse(response.data.match(/<script>window\.initialState=(.*?)<\/script>/)[1]);

    const list = data.information.informationList.itemList
        .filter((item) => item.itemType === 10)
        .map((item) => ({
            title: item.templateMaterial.widgetTitle,
            link: `${rootUrl}/p/${item.itemId} `,
            pubDate: parseDate(item.templateMaterial.publishTime),
        }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.articleDetailContent').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${response.data.match(/shareTitle: "(.*)频道.*",/)[1]} - 36氪资讯`,
        link: currentUrl,
        item: items,
    };
};
