const got = require('@/utils/got');

module.exports = async (ctx) => {
    const res = await got({
        method: 'get',
        url: 'https://index.say-huahuo.com/vn.json',
    });

    const data = JSON.parse(res.body).reverse();

    ctx.state.data = {
        title: 'galgame汉化硬盘galgame资源下载-花火学园论坛',
        link: 'https://index.say-huahuo.com/',
        description: '花火学园',
        item: data.map((item) => ({
            title: item.title,
            description: `<img src="${item.img}">`,
            pubDate: new Date(parseInt(item.date.substr(0, 4)), parseInt(item.date.substr(4, 2)), parseInt(item.date.substr(6, 2))).toUTCString(),
            link: item.url,
        })),
    };
};
