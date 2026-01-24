import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

interface MovieItem {
    id: number;
    nm: string;
    img: string;
    sc: number;
    star: string;
    rt: string;
    showInfo: string;
    wish: number;
    version?: string;
}

interface HotResponse {
    movieList: MovieItem[];
}

export const route: Route = {
    path: '/hot',
    categories: ['multimedia'],
    example: '/maoyan/hot',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.maoyan.com/films?showType=1'],
            target: '/hot',
        },
    ],
    name: '正在热映',
    maintainers: ['JackyST0'],
    handler,
};

async function handler() {
    const apiUrl = 'https://m.maoyan.com/ajax/movieOnInfoList';

    const response = await ofetch<HotResponse>(apiUrl);

    const movies = response.movieList || [];

    const items = movies.map((movie) => ({
        title: `${movie.sc ? `[${movie.sc}分] ` : ''}${movie.nm}`,
        link: `https://www.maoyan.com/films/${movie.id}`,
        description: `
            <img src="${movie.img}" />
            <p><strong>${movie.nm}</strong></p>
            ${movie.sc ? `<p>评分：${movie.sc}</p>` : ''}
            <p>上映时间：${movie.rt}</p>
            <p>主演：${movie.star}</p>
            <p>想看人数：${movie.wish}</p>
            <p>${movie.showInfo}</p>
        `,
    }));

    return {
        title: '猫眼电影 - 正在热映',
        link: 'https://www.maoyan.com/films?showType=1',
        description: '猫眼电影正在热映列表',
        item: items,
    };
}
