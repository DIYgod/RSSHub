const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const host = 'http://www.cs.swust.edu.cn/';
    let type = ctx.params.type;
    let info = '新闻动态';
    let word = 'news';
    if (type === '2') {
        info = '学术动态';
        word = 'academic';
    } else if (type === '3') {
        info = '通知公告';
        word = 'notice';
    } else if (type === '4') {
        info = '教研动态';
        word = 'Teach_Research';
    } else {
        type = '1';
    }

    const response = await axios({
        method: 'get',
        url: host + word,
        headers: {
            'User-Agent': config.ua,
            Referer: host,
        },
    });

    const $ = cheerio.load(response.data);
    const text = $('a', '.list.list3');

    ctx.state.data = {
        title: `西南科技大学 计科学院 ${info}`,
        link: host + word,
        description: `西南科技大学 计科学院 ${info}`,
        item:
            text &&
            text
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: $('.imgdesc', item)
                            .find('.imgtitle')
                            .text(),
                        description: $('.imgdesc', item)
                            .find('.imgtext')
                            .text(),
                        pubDate: new Date(
                            Date.parse(
                                $('.imgdesc', item)
                                    .contents()
                                    .filter(function() {
                                        return this.nodeType === 3;
                                    })
                                    .text()
                                    .replace('[', '')
                                    .replace(']', '')
                            )
                        ),
                        link: host + item.attr('href'),
                    };
                })
                .get(),
    };
};
