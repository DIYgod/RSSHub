const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const baseUrl = 'https://www.rccp.pku.edu.cn/mzyt/';

module.exports = async (ctx) => {
    const response = await got(baseUrl);

    const $ = cheerio.load(response.data);
    ctx.state.data = {
        title: '每周一推 - 北京大学中国政治学研究中心',
        link: baseUrl,
        description: $('meta[name="description"]').attr('content'),
        item: $('li.list')
            .map((index, item) => ({
                title: $(item).find('a').text().trim(),
                description: '',
                pubDate: parseDate($(item).find('span').first().text(), '[YYYY-MM-DD]'),
                link: baseUrl + $(item).find('a').attr('href'),
            }))
            .get(),
    };
};
