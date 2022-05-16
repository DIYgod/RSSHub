const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const response = await got({
        method: 'post',
        url: 'https://www.yunspe.com/wp-json/b2/v1/getNewsflashesList',
        headers: {
            Referer: 'https://www.yunspe.com/newsflashes',
            'content-type': 'application/x-www-form-urlencoded',
        },
        body: 'paged=1&term=0&post_paged=1',
    });
    const data = response.data.data;

    const out = data.map((item) => {
        const title = item[0].title.replace('【微语简报】', '');
        const link = item[0].link;
        const datematch = item[0]._date.match(/datetime="(.*)" itemprop/);
        const date = datematch && datematch[1];
        const description = item[0].content
            .substring(item[0].content.indexOf('【今日简报】') + 6)
            .replace(/(\d*\.\s)|(【)/g, '<br>$1$2')
            .substring(4);

        const single = {
            title,
            link,
            pubDate: date && timezone(parseDate(date, 'YYYY-M-D H:mm:ss'), +8),
            description,
        };

        return single;
    });
    ctx.state.data = {
        title: '微语简报',
        link: 'https://www.yunspe.com/newsflashes',
        description: '微语简报',
        item: out,
    };
};
