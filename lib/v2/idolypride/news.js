const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://idolypride.jp/wp-json/wp/v2/news',
    });
    const list = response.data;

    ctx.state.data = {
        title: '偶像荣耀-新闻',
        link: 'https://idolypride.jp/news',
        item: list.map((item) => {
            const title = item.title.rendered;
            const link = item.link;
            const pubDate = timezone(parseDate(item.date_gmt), 0);
            const rendered = item.content.rendered;

            return {
                title,
                link,
                pubDate,
                description: rendered,
            };
        }),
    };
};
