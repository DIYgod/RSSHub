const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const language = ctx.params.language || 'en';

    const rootUrl = 'https://www.who.int';
    const currentUrl = `${rootUrl}/${language === 'en' ? '' : `${language}/`}news`;
    const apiUrl = `${rootUrl}/api/news/newsitems?sf_culture=${language}&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDateAndTime,ItemDefaultUrl`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.value.map((item) => ({
        title: item.Title,
        link: `${currentUrl}/item/${item.ItemDefaultUrl}`,
        pubDate: parseDate(item.PublicationDateAndTime),
    }));

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    item.description = detailResponse.data.match(/"description":"(.*)","datePublished"/)[1];

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: 'News - WHO',
        link: currentUrl,
        item: items,
    };
};
