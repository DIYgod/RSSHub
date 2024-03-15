import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/movie/ustop',
    categories: ['social-media'],
    example: '/douban/movie/ustop',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '北美票房榜',
    maintainers: ['DIYgod'],
    handler,
};

async function handler() {
    const response = await got({
        method: 'get',
        url: 'https://api.douban.com/v2/movie/us_box?apikey=0df993c66c0c636e29ecbb5344252a4a',
    });
    const movieList = response.data.subjects;

    return {
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
    };
}
