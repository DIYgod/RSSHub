const got = require('@/utils/got');
const cheerio = require('cheerio');

const url = 'http://jwc.njfu.edu.cn/sy/';
const map = {
    xjfw: '校级发文',
    tzgg: '通知公告',
    sjfw: '上级发文',
    xzzq: '下载专区',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'tzgg';
    const link = category === 'xzzq' ? 'http://jwc.njfu.edu.cn/xzzq/' : `${url}${category}/`;

    const response = await got(link, {
        method: 'get',
        hooks: {
            beforeRedirect: [
                (options, response) => {
                    const cookie = response.headers['set-cookie'];
                    if (cookie) {
                        const cook = cookie.map((c) => c.split(';')[0]).join('; ');
                        options.headers.Cookie = cook;
                        options.headers.Referer = response.url;
                    }
                },
            ],
        },
    });
    const $ = cheerio.load(response.data);
    const list = $('.List_R4');

    ctx.state.data = {
        title: '南京林业大学教务处-' + map[category],
        link,
        description: `南京林业大学教务处-${map[category]}`,
        item: list
            .map((index, item) => ({
                title: $(item).find('a').attr('title'),
                description: $(item).find('a').attr('title'),
                pubDate: $(item).find('.List_R4_R').text().replaceAll(/\[|]/g, ''),
                link: $(item).find('a').attr('href'),
            }))
            .get(),
    };
};
