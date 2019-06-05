const got = require('@/utils/got');

module.exports = async (ctx) => {
    const res = await got({
        method: 'get',
        url: 'https://index.say-huahuo.com/vn.json',
    });

    const data = eval(res.body).reverse();

    ctx.state.data = {
        title: 'galgame汉化硬盘galgame资源下载-花火学园论坛',
        link: 'https://index.say-huahuo.com/',
        description: '花火学园',
        item: data.map((item) => ({
            title: item.title,
            description: `<img referrerpolicy="no-referrer" src="${item.img}">`,
            pubDate: new Date(item.date * 1000).toUTCString(),
            link: item.url,
        })),
    };
};
