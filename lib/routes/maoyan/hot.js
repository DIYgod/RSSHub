const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://m.maoyan.com/ajax/movieOnInfoList',
    });
    const data = response.data.movieList;
    const items = data.map((item) => {
        const rating = item.sc > 0 ? `评分：${item.sc}` : '';

        return {
            title: `${item.nm} ${rating}`,
            description: `<img src="${item.img.replace('w.h', '1000.1000')}"> <br> ${rating} <br> 演员：${item.star} <br> 上映信息：${item.showInfo}`,
            link: `https://maoyan.com/films/${item.id}`,
            pubDate: new Date(item.rt).toUTCString(),
        };
    });

    ctx.state.data = {
        title: `猫眼电影 - 正在热映`,
        link: `https://maoyan.com/films`,
        description: `猫眼电影 - 正在热映`,
        item: items,
    };
};
