const axios = require('axios');
const art = require('art-template');
const path = require('path');

module.exports = async (ctx) => {
    const city = ctx.params.city;
    const score = parseFloat(ctx.params.score, 10) || 7.5;
    const response = await axios({
        method: 'get',
        url: 'https://api.douban.com/v2/movie/in_theaters',
        params: { city }
    });
    const movieList = response.data.subjects.
        filter((item) => item.rating.average >= score);

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: `${city} 最近上映的好电影`,
        link: `https://movie.douban.com/cinema/nowplaying/${city}/`,
        description: `${city} 最近上映的评分大于等于${score}分的电影`,
        lastBuildDate: new Date().toUTCString(),
        item: movieList.map((item) => ({
            title: item.title,
            description: `中文名：${item.title}<br> 类型：${item.genres.join(' | ')}  <br>评分：${item.rating.average} <br/> <img referrerpolicy="no-referrer" src="${item.images.large}">`,
            link: item.alt
        })),
    });
};