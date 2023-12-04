const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '';
    const classId = ctx.params.classId ?? '';

    const rootUrl = 'https://www.52hrtt.com';
    const currentUrl = `${rootUrl}/global/n/w/symposium/${id}`;
    const apiUrl = `${rootUrl}/s/webapi/global/symposium/getInfoList?symposiumId=${id}${classId ? `&symposiumclassId=${classId}` : ''}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const titleResponse = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(titleResponse.data);

    const list = response.data.data
        .filter((item) => item.infoTitle)
        .map((item) => ({
            title: item.infoTitle,
            author: item.quoteFrom,
            pubDate: timezone(parseDate(item.infoStartTime), +8),
            link: `${rootUrl}/global/n/w/info/${item.infoCentreId}`,
        }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('.info-content').html();

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
