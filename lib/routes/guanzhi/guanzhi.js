const got = require('@/utils/got');

module.exports = async (ctx) => {
    const {
        data: { data },
    } = await got.get('https://interface.meiriyiwen.com/article/today');

    ctx.state.data = {
        title: '观止',
        link: 'https://meiriyiwen.com/',
        description: '每天一篇精选优质短篇',
        item: [
            {
                title: data.title,
                description: data.content,
                author: data.author,
                pubDate: new Date(`${data.date.curr.substr(0, 4)}-${data.date.curr.substr(4, 2)}-${data.date.curr.substr(6)} 00:00:01`).toUTCString(),
                guid: data.date.curr,
                link: 'https://meiriyiwen.com/',
            },
        ],
    };
};
