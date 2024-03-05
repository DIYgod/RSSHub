// @ts-nocheck
import got from '@/utils/got';

export default async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://api.douban.com/v2/movie/us_box?apikey=0df993c66c0c636e29ecbb5344252a4a',
    });
    const movieList = response.data.subjects;

    ctx.set('data', {
        title: '豆瓣电影北美票房榜',
        link: 'https://movie.douban.com/chart',
        item: movieList.map((item) => {
            item = item.subject;
            return {
                title: item.title,
                description: `标题：${item.title}<br> 影片类型：${item.genres.join(' | ')}  <br>评分：${item.rating.stars === '00' ? '无' : item.rating.average} <br/> <img src="${item.images.large}">`,
                link: item.alt,
            };
        }),
    });
};
