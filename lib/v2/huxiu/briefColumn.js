const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `https://api-brief.huxiu.com/briefColumn/getContentListByCategoryId`;
    const response = await got
        .post(link, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `platform=www&brief_column_id=${id}&last_id=`,
        })
        .json();

    const list = response.data.datalist;

    const items = await Promise.all(
        list.map((item) => {
            const link = `https://www.huxiu.com/brief/${item.brief_id}`;

            return ctx.cache.tryGet(link, async () => {
                const detailResponse = await got(link);
                const $ = cheerio.load(detailResponse.data);

                const description = $('#js-part').html();

                return {
                    title: item.title,
                    pubDate: item.format_publish_time.includes('前') ? parseRelativeDate(item.format_publish_time) : parseDate(item.format_publish_time),
                    description,
                    link,
                };
            });
        })
    );

    const title = async () => {
        const res = await got(`https://www.huxiu.com/briefColumn/${id}.html`);
        const $ = cheerio.load(res.data);

        return $('#top > div:nth-child(1) > div > div.brief-content__name').text();
    };

    ctx.state.data = {
        title: `虎嗅 - ${await title()}`,
        link: `https://www.huxiu.com/briefColumn/${id}.html`,
        item: items,
    };
};
