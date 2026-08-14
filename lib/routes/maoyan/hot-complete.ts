import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/hotComplete/:orderby?/:ascOrDesc?/:top?',
    categories: ['multimedia'],
    example: '/maoyan/hotComplete',
    parameters: {
        orderby: '排序条件，(score: 评分, pubDate: 发布时间)',
        ascOrDesc: '正序或倒序 (asc: 正序, desc: 倒序) 默认倒序',
        top: '取前多少条，默认取所有',
    },
    name: '正在热映 - 完整版',
    maintainers: ['chenbstack'],
    handler,
};

async function handler(ctx: Context) {
    const { orderby, ascOrDesc, top } = ctx.req.param();

    const response = await ofetch('https://m.maoyan.com/ajax/movieOnInfoList');
    const movieIds = response.movieIds;

    const start = response.movieList.length;
    const movieIdsArr: number[][] = Array.from({ length: Math.ceil((movieIds.length - start) / 10) }, (_, i) => movieIds.slice(start + i * 10, start + (i + 1) * 10));

    const dataArrs = await Promise.all(
        movieIdsArr.map(async (idsTemp) => {
            const responseTemp = await ofetch('https://m.maoyan.com/ajax/moreComingList', {
                query: {
                    movieIds: idsTemp.toString(),
                    token: '',
                },
            });
            return responseTemp.coming?.length > 0 ? responseTemp.coming : [];
        })
    );

    let data = [...response.movieList, ...dataArrs.flat()];

    if (orderby) {
        data.sort((a, b) => {
            if (orderby === 'pubDate') {
                return ascOrDesc === 'asc' ? new Date(a.rt).getTime() - new Date(b.rt).getTime() : new Date(b.rt).getTime() - new Date(a.rt).getTime();
            }
            return ascOrDesc === 'asc' ? a.sc - b.sc : b.sc - a.sc;
        });
    }
    const topCount = Number(top);
    if (topCount > 0 && topCount < data.length) {
        data = data.slice(0, topCount - 1);
    }

    const items = data.map((item) => {
        const rating = item.sc > 0 ? `评分：${item.sc}` : '';

        return {
            title: `${item.nm} ${rating}`,
            description: `<img src="${item.img.replace('w.h', '1000.1000')}"> <br> ${rating} <br> 演员：${item.star} <br> 上映信息：${item.showInfo}`,
            link: `https://maoyan.com/films/${item.id}`,
            pubDate: timezone(parseDate(item.rt), 8),
        };
    });

    return {
        title: '猫眼电影 - 正在热映 - 完整版',
        link: 'https://maoyan.com/films',
        description: '猫眼电影 - 正在热映',
        item: items,
    };
}
