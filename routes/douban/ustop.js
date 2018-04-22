const axios = require('axios');
const art = require('art-template');
const path = require('path');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://api.douban.com/v2/movie/us_box',
    });
    const movieList = response.data.subjects;

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: '豆瓣电影北美票房榜',
        link: 'https://movie.douban.com/chart',
        lastBuildDate: new Date().toUTCString(),
        item: movieList.map((item) => {
            item = item.subject;
            return {
                title: item.title,
                description: `标题：${item.title}<br> 影片类型：${item.genres.join(' | ')}  <br>评分：${item.rating.stars === '00' ? '无' : item.rating.average} <br/> <img referrerpolicy="no-referrer" src="${item.images.large}">`,
                link: item.alt
            };
        }),
    });
};