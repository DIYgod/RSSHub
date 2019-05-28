const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://api.douban.com/v2/movie/coming_soon',
    });
    const movieList = response.data.subjects;

    ctx.state.data = {
        title: '即将上映的电影',
        link: 'https://movie.douban.com/cinema/later/',
        item: movieList.map((item) => ({
            title: item.title,
            description: `标题：${item.title}<br> 影片类型：${item.genres.join(' | ')}  <br>评分：${item.rating.stars === '00' ? '无' : item.rating.average} <br/> <img referrerpolicy="no-referrer" src="${item.images.large}">`,
            link: item.alt,
        })),
    };
};
