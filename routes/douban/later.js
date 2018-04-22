const axios = require('axios');
const art = require('art-template');
const path = require('path');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://api.douban.com/v2/movie/coming_soon',
    });
    const movieList = response.data.subjects;

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: '即将上映的电影',
        link: 'https://movie.douban.com/cinema/later/',
        lastBuildDate: new Date().toUTCString(),
        item: movieList.map((item) => ({
            title: item.title,
            description: `标题：${item.title}<br> 影片类型：${item.genres.join(' | ')}  <br>评分：${item.rating.stars === '00' ? '无' : item.rating.average} <br/> <img referrerpolicy="no-referrer" src="${item.images.large}">`,
            link: item.alt
        })),
    });
};