const got = require('@/utils/got');

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = async (ctx) => {
    const orderby = ctx.params.orderby;
    const ascOrDesc = ctx.params.ascOrDesc;
    const top = ctx.params.top;

    const response = await got({
        method: 'get',
        url: 'https://m.maoyan.com/ajax/movieOnInfoList',
        headers: {
            Referer: 'https://m.maoyan.com/',
        },
    });
    let data = response.data.movieList;
    const movieIds = response.data.movieIds;

    const movieIdsArr = [];
    for (let i = data.length; i < movieIds.length; i += 10) {
        const movieIdsTemp = movieIds.slice(i, i + 10);
        movieIdsArr.push(movieIdsTemp);
    }

    const dataArrs = await Promise.all(
        movieIdsArr.map(async (idsTemp) => {
            await sleep(500);
            const responseTemp = await got({
                method: 'get',
                url: 'https://m.maoyan.com/ajax/moreComingList',
                searchParams: {
                    movieIds: idsTemp.toString(),
                    token: '',
                },
                headers: {
                    Referer: 'https://m.maoyan.com/',
                },
            });
            const dataTemp = responseTemp.data.coming;
            return dataTemp && dataTemp.length > 0 ? dataTemp : [];
        })
    );

    for (const dataArr of dataArrs) {
        data.push(...dataArr);
    }

    if (orderby) {
        data.sort((a, b) => {
            if (orderby === 'pubDate') {
                return ascOrDesc === 'asc' ? new Date(a.rt).getTime() - new Date(b.rt).getTime() : new Date(b.rt).getTime() - new Date(a.rt).getTime();
            } else {
                return ascOrDesc === 'asc' ? a.sc - b.sc : b.sc - a.sc;
            }
        });
    }
    if (top && top > 0 && top < data.length) {
        data = data.slice(0, top - 1);
    }

    const items = await Promise.all(
        data.map((item) => {
            const rating = item.sc > 0 ? `评分：${item.sc}` : '';

            return {
                title: `${item.nm} ${rating}`,
                description: `<img src="${item.img.replace('w.h', '1000.1000')}"> <br> ${rating} <br> 演员：${item.star} <br> 上映信息：${item.showInfo}`,
                link: `https://maoyan.com/films/${item.id}`,
                pubDate: new Date(item.rt).toUTCString(),
            };
        })
    );

    ctx.state.data = {
        title: `猫眼电影 - 正在热映 - 完整版`,
        link: `https://maoyan.com/films`,
        description: `猫眼电影 - 正在热映`,
        item: items,
    };
};
