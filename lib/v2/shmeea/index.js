const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseURL = 'http://www.shmeea.edu.cn';
    const rootUrl = baseURL + '/page/08000/index.html';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const data = response.data;

    const $ = cheerio.load(data);

    const list = $('#main .pageList li');

    const items = await Promise.all(
        list.map(async (i, item) => {
            item = $(item);
            const link = baseURL + item.find('a').attr('href');
            const description = await ctx.cache.tryGet(link, async () => {
                const result = await got.get(link);

                const $ = cheerio.load(result.data);

                return $('#ivs_content').html();
            });
            return {
                title: item.find('a').text(),
                pubDate: new Date(item.find('.listTime').text()),
                link,
                description,
            };
        })
    );

    ctx.state.data = {
        title: '上海市教育考试院',
        description: '消息速递',
        link: baseURL,
        item: items,
    };
};
