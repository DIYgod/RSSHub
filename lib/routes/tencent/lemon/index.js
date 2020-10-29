const got = require('@/utils/got');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const url = 'https://lemon.qq.com/lab/js/source.js';

    const data = (await got.get(url)).data;
    const list = Function(data + ';return Array.isArray(list) ? list : []')();

    const items = list.slice(0, 10).map((i) => ({
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
