const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {

    const response = await got({
        method: 'get',
        url: 'https://idolypride.jp/wp-json/wp/v2/news',
    });
    const list = Object.entries(response.data);

    ctx.state.data = {
        title: '偶像荣耀-新闻',
        link: 'https://idolypride.jp/news',
        item:
            list &&
            list
                .map((item) => {
                    const title = item[1].title.rendered;
                    const link = item[1].link;
                    const pubDate = timezone(parseDate(item[1].date_gmt), 0);
                    const guid = item[1].id.toString();

                    return {
                        title,
                        link,
                        pubDate,
                        guid,
                        };
                }),
    };
};