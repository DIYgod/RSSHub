const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const host = 'http://www.cs.swust.edu.cn/';

module.exports = async (ctx) => {
    const axios_ins = axios.create({
        headers: {
            Referer: host,
        },
        responseType: 'arraybuffer',
    });

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

    const response = await axios_ins.get(host + word);
    const $ = cheerio.load(response.data);
    const text = $('a', '.list.list3');
    const items = [];

    for (let i = 0; i < text.length; i++) {
        const link = host + $(text[i]).attr('href');
        const article = await axios_ins.get(link);
        const $1 = cheerio.load(article.data);
        const res = $1('small')
            .contents()
            .filter(function() {
                return this.nodeType === 3;
            })
            .text();
        const reg = new RegExp('\n', 'g'); // 匹配回车符
        const str = res.replace(reg, '').toString(); // 替换回车符为""，再转为string类型
        const arr = str.split(' '); // 将字符串每个字符转换为数组的元素
        let date = arr[1] + ' ' + arr[2];
        date = date.replace(/^\s+|\s+$/g, '');
        const item = {
            title: $('.imgdesc', $(text[i]))
                .find('.imgtitle')
                .text(),
            descriptions: $('.imgdesc', $(text[i]))
                .find('.imgtext')
                .text(),
            pubDate: new Date(date).toUTCString(),
            link: link,
        };
        items.push(item);
    }

    ctx.state.data = {
        title: `西南科技大学 计科学院 ${info}`,
        link: host + word,
        description: `西南科技大学 计科学院 ${info}`,
        item: items.map((item) => ({
            title: item.title,
            description: item.descriptions,
            link: item.link,
            pubDate: item.pubDate,
        })),
    };
};
