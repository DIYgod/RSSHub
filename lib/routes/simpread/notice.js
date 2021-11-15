import got from '~/utils/got.js';
const md = require('markdown-it')();

export default async (ctx) => {
    const url = 'https://static.simp.red/notice';
    const response = await got.get(url);
    const data = response.data.notice;
    ctx.state.data = {
        title: 'SimpRead 消息通知',
        link: 'https://simpread.pro/changelog.html',
        description: 'SimpRead 消息通知',
        item: data.map((item) => ({
            description: md.render(item.content),
            link: 'https://simpread.pro/changelog.html',
            pubDate: item.date,
            title: `${item.category.name}-${item.title}`,
            author: 'SimpRead',
        })),
    };
};
