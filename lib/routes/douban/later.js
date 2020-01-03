const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://api.douban.com/v2/movie/coming_soon?apikey=0df993c66c0c636e29ecbb5344252a4a',
    });
    const movieList = response.data.subjects;

    ctx.state.data = {
        title: '即将上映的电影',
        link: 'https://movie.douban.com/cinema/later/',
        item: movieList.map((item) => ({
            title: item.title,
            description: `标题：${item.title}<br> 影片类型：${item.genres.join(' | ')}  <br>评分：${item.rating.stars === '00' ? '无' : item.rating.average} <br/> <img src="${item.images.large}">`,
            link: item.alt,
        })),
    };
};
