const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'http://www.rccp.pku.edu.cn/mzyt/';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: baseUrl,
    });

    const $ = cheerio.load(response.data);
    ctx.state.data = {
        title: `每周一推 - 北京大学中国政治学研究中心`,
        link: baseUrl,
        description: `北京大学中国政治学研究中心，北大中国政治学研究中心，北大政治学研究中心，中国政治学研究中心，政治学研究中心，政治学，北大政治学，北京大学，俞可平
        北京大学中国政治学研究中心官方网站：www.rccp.pku.edu.cn 。
         北京大学中国政治学研究中心微信公众平台：“北大政治学”（微信号：PKURCCP）`,
        item: $('li.list')
            .map((index, item) => ({
                title: $(item).find('a').text().trim(),
                description: '',
                pubDate: $(item)
                    .find('span')
                    .first()
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}/g)[0],

                link: baseUrl + $(item).find('a').attr('href'),
            }))
            .get(),
    };
};
