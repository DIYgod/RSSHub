const got = require('@/utils/got');
const cheerio = require('cheerio');
const host = 'http://www.cs.swust.edu.cn/';

module.exports = async (ctx) => {
    const got_ins = got.extend({
        headers: {
            Referer: host,
        },
    });
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

    const response = await got_ins.get(host + word);
    const $ = cheerio.load(response.data);
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
                const article = await got_ins.get(link);
                const $1 = cheerio.load(article.data);
                const res = $1('small')
                    .contents()
                    .filter(function () {
                        return this.nodeType === 3;
                    })
                    .text();
                const reg = new RegExp('\n', 'g'); // 匹配回车符
                const str = res.replace(reg, '').toString(); // 替换回车符为""，再转为string类型
                const arr = str.split(' '); // 将字符串每个字符转换为数组的元素
                let date = arr[1] + ' ' + arr[2];
                date = date.replace(/^\s+|\s+$/g, '');

                resultItem = {
                    title: $('.imgdesc', $item).find('.imgtitle').text(),
                    description: $('.imgdesc', $item).find('.imgtext').text(),
                    pubDate: new Date(date).toUTCString(),
                    link: link,
                };

                ctx.cache.set(link, JSON.stringify(resultItem));
            }
            // };
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
