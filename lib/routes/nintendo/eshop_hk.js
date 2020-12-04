const got = require('@/utils/got');
const util = require('./utils');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.nintendo.com.hk/data/json/switch_software.json',
    });
    const data = response.data.slice(0, 9).filter(({ link }) => link.startsWith('https://'));

    // 获取游戏描述
    const result = await util.ProcessItem(data, ctx.cache);

    ctx.state.data = {
        title: `Nintendo eShop (港服) 新游戏`,
        link: `https://www.nintendo.com.hk/software/switch/index.html`,
        description: `Nintendo eShop (港服) 新上架的游戏`,
        item: result.map((item) => ({
            title: item.title,
            description: `<img src="https://www.nintendo.com.hk/software/img/bnr/${item.thumb_img}"><br><strong>发售日期：</strong>${item.release_date}<br><strong>价格：</strong>${item.price}港币<br><strong>支持中文：</strong>${
                item.lang === 'CN' ? '是' : '否'
            }<br><strong>发行商：</strong>${item.maker_publisher}<br>${item.content}`,
            link: item.link,
        })),
    };
};
