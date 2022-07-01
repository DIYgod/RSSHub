const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();

    const response = await got({
        method: 'get',
        url: 'http://job.hrbeu.edu.cn/HrbeuJY/web',
    });

    const $ = cheerio.load(response.data);

    const list = $('div.articlecontent')
        .map((_, item) => {
            const link = $(item).find('a.bigTitle').attr('href');
            return {
                title: $(item).find('a.bigTitle').text(),
                pubDate:
                    $(item)
                        .text()
                        .replace(/[ ]|[\r\n]/g, '')
                        .substr(-10) +
                    ' ' +
                    hour +
                    ':' +
                    minute,
                description: $(item).find('a.bigTitle').text() + '<br><br>' + '点击标题，登录查看招聘详情',
                link,
            };
        })
        .get();

    ctx.state.data = {
        title: '大型招聘会',
        link: 'http://job.hrbeu.edu.cn/HrbeuJY/web',
        item: list,
        allowEmpty: true,
    };
};
