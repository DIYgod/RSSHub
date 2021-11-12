const got = require('@/utils/got');
const cheerio = require('cheerio');

const homeUrl = 'http://www.bio.pku.edu.cn/homes/Index/news_jz/7/7.html';
const baseUrl = 'http://www.bio.pku.edu.cn';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: homeUrl,
    });

    const $ = cheerio.load(response.data);
    ctx.state.data = {
        title: `北京大学生命科学学院近期讲座`,
        link: homeUrl,
        description: `北京大学生命科学学院近期讲座`,
        item: $('a.clearfix')
            .map((index, item) => ({
                title: $(item).find('p').text().trim(),
                description: '日期: ' + $(item).find('span'), // ${item.find('.chair_txt div').find('span').second().text()}

                link: baseUrl + $('a.clearfix').attr('href'),
            }))
            .get(),
    };
};
