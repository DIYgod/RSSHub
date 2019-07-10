const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://testerhome.com/topics/last',
    });

    const $ = cheerio.load(response.data);
    const resultItem = $('.item-list .topic')
        .map((index, elem) => {
            elem = $(elem);
            const $link = elem.find('.title a');
            const title = $link.attr('title');

            return {
                title,
                link: `https://testerhome.com${$link.attr('href')}`,
                description: title,
            };
        })
        .get();

    ctx.state.data = {
        title: 'TesterHome-最新发布',
        link: 'https://testerhome.com/topics/last',
        description: 'TesterHome软件测试社区，人气最旺的软件测试技术门户，提供软件测试社区交流，测试沙龙。',
        item: resultItem,
    };
};
