const cheerio = require('cheerio');
const { instance } = require('./helper');
const host = 'http://www.cs.swust.edu.cn/';

module.exports = async (ctx) => {
    const type = ctx.params.type || 1;
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
    }

    const response = await instance.get(host + word);
    const $ = cheerio.load(response.body);
    const text = $('a', '.list.list3');
    const resultItems = await Promise.all(
        text.toArray().map(async (item) => {
            const $item = $(item);
            const link = host + $item.attr('href');
            let resultItem = {};

            const value = await ctx.cache.get(link);

            if (value) {
                resultItem = JSON.parse(value);
            } else {
                const date = $('.imgdesc', $item)
                    .contents()
                    .filter(function () {
                        return this.nodeType === 3;
                    })
                    .text()
                    .replace(']', '')
                    .replace('[', '');
                resultItem = {
                    title: $('.imgdesc', $item).find('.imgtitle').text(),
                    description: $('.imgdesc', $item).find('.imgtext').text(),
                    pubDate: new Date(date).toUTCString(),
                    link: link,
                };

                ctx.cache.set(link, JSON.stringify(resultItem));
            }
            return Promise.resolve(resultItem);
        })
    );

    ctx.state.data = {
        allowEmpty: true,
        title: `西南科技大学 计科学院 ${info}`,
        link: host + word,
        description: `西南科技大学 计科学院 ${info}`,
        item: resultItems,
    };
};
