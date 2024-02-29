const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://oa.jlu.edu.cn/defaultroot/PortalInformation!jldxList.action',
    });

    const data = response.data;

    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const list = $('div[class="li rel"]');

    ctx.state.data = {
        title: 'jlu oa',
        link: 'https://oa.jlu.edu.cn/defaultroot/PortalInformation!jldxList.action',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a.font14').text(),
                        description: item.find('a.column').text(),
                        link: item.find('a.font14').attr('href'),
                    };
                })
                .get(),
    };
};
