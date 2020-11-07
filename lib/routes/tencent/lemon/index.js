const got = require('@/utils/got');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const url = 'https://lemon.qq.com/lab/js/source.js';

    let data = (await got.get(url)).data.match(/(?<=(const list = ))(.*)(\])/gs)[0];

    // eslint-disable-next-line no-eval
    data = eval('(' + data + ')').slice(0, 10);

    const items = data.map((i) => ({
        title: i.name,
        description: `
        ${i.comment}</br>
        <img src="${i.logo}"></br>
        <a href="${i.downloadlink}">下载链接</a>
        `,
        link: `https://lemon.qq.com/lab/app/${i.shortname}.html`,
        author: i.referrer,
        pubDate: date(i.date),
    }));

    ctx.state.data = {
        title: '腾讯柠檬精选',
        link: 'https://lemon.qq.com/lab/',
        item: items,
    };
};
