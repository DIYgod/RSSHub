const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const language = ctx.params.language || 'en';

    const rootUrl = 'https://www.who.int';
    const currentUrl = `${rootUrl}/${language === 'en' ? '' : `${language}/`}director-general/speeches`;
    const apiUrl = `${rootUrl}/api/hubs/speeches?sf_culture=${language}&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDateAndTime,ItemDefaultUrl`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.value.map((item) => ({
        title: item.Title,
        link: `${currentUrl}/detail/${item.ItemDefaultUrl}`,
        pubDate: parseDate(item.PublicationDateAndTime),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.sf-detail-body-wrapper').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Speeches - WHO',
        link: currentUrl,
        item: items,
    };
};
