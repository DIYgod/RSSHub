const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://api.douban.com/v2/movie/us_box',
    });
    const movieList = response.data.subjects;

    ctx.state.data = {
        title: '豆瓣电影北美票房榜',
        link: 'https://movie.douban.com/chart',
        item: movieList.map((item) => {
            item = item.subject;
            return {
                title: item.title,
                description: `标题：${item.title}<br> 影片类型：${item.genres.join(' | ')}  <br>评分：${item.rating.stars === '00' ? '无' : item.rating.average} <br/> <img referrerpolicy="no-referrer" src="${item.images.large}">`,
                link: item.alt,
            };
        }),
    };
};
