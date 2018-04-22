const axios = require('axios');
const art = require('art-template');
const path = require('path');

module.exports = async (ctx) => {
    const city = ctx.params.city;
    const score = parseFloat(ctx.params.score, 10);
    const response = await axios({
        method: 'get',
        url: 'https://api.douban.com/v2/movie/in_theaters',
        params: { city }
    });
    const movieList = score ? response.data.subjects.filter((item) => item.rating.average >= score) : response.data.subjects;

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: `${city ? city : ''}正在上映的${score ? `超过 ${score} 分的` : ''}电影`,
        link: 'https://movie.douban.com/cinema/nowplaying/',
        lastBuildDate: new Date().toUTCString(),
        item: movieList.map((item) => ({
            title: item.title,
            description: `标题：${item.title}<br> 影片类型：${item.genres.join(' | ')}  <br>评分：${item.rating.average} <br/> <img referrerpolicy="no-referrer" src="${item.images.large}">`,
            link: item.alt
        })),
    });
};