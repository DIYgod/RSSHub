const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');


module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = `https://www.51cto.com/${category}`;
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $("div[class='article-articleitem article-ir articleItem']")
    .map((i, e) => {
        const element = $(e);
        const title = element.find('a[class="usehover article-irl-ct_title"]').text();
        const link = element.find('a[class="usehover article-irl-ct_title"]').attr('href');
        const description = element.find('a[class="split-top-m usehover pc-three-line article-abstract"]').text();
        const dateraw = element.find("p[class='article-irl-cb_time']").text();

        return {
            title,
            description,
            link,
            pubDate: parseDate(dateraw, 'YYYY-MM-DD HH:mm:ss'),
        };
    })
    .get();


    ctx.state.data = {
        title: '51cto',
        link: url,
        item: list,
    };  
};
