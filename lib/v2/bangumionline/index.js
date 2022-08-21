const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = 'https://bangumi.online/api/home';

    const response = await got(url);

    const list = response.data.data.list;

    const items = list.map((item) => ({
        title: `${item.title_zh} - 第 ${item.volume} 集`,
        description: `<img src='https:${item.cover}'>`,
        link: `https://bangumi.online/watch/${item.vid}`,
    }));

    ctx.state.data = {
        title: 'アニメ新番組',
        link: 'https://bangumi.online',
        item: items,
    };
};
