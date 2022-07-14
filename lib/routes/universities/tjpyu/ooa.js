const got = require('@/utils/got');
const cheerio = require('cheerio');

const ooa_base_url = 'http://oaa.tju.edu.cn/';
const repo_url = 'https://github.com/DIYgod/RSSHub/issues';

module.exports = async (ctx) => {
    const type = ctx.params && ctx.params.type;
    let path, subtitle;

    switch (type) {
        case 'news':
            subtitle = '新闻动态';
            path = 'xwdt.htm';
            break;
        case 'notification':
            subtitle = '通知公告';
            path = 'tzgg.htm';
            break;
        default:
            subtitle = '新闻动态';
            path = 'xwdt.htm';
    }
    let response = null;
    try {
        response = await got({
            method: 'get',
            url: ooa_base_url + path,
            headers: {
                Referer: ooa_base_url,
            },
        });
    } catch (e) {
        // ignore error handler
        // console.log(e);
    }

    if (response === null) {
        ctx.state.data = {
            title: '天津大学教务处 - ' + subtitle,
            link: ooa_base_url + path,
            description: '链接失效' + ooa_base_url + path,
            item: [
                {
                    title: '提示信息',
                    link: repo_url,
                    description: `<h2>请到<a href=${repo_url}>此处</a>提交Issue</h2>`,
                },
            ],
        };
    } else {
        const $ = cheerio.load(response.data);
        const list = $('.notice_l > ul > li > dl > dt').slice(0, 15);

        ctx.state.data = {
            title: '天津大学教务处 - ' + subtitle,
            link: ooa_base_url + path,
            description: null,
            item:
                list &&
                list
                    .map((index, item) => ({
                        title: $('h2', item).text(),
                        pubDate: new Date($('.fl_01_r_time', item).text().slice(2) + '-' + $('.fl_01_r_time', item).text().slice(0, 2)).toUTCString(),
                        link: $('a', item).attr('href'),
                        description: $('p', item).text(),
                    }))
                    .get(),
        };
    }
};
