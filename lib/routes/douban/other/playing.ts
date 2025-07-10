import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: ['/movie/playing', '/movie/playing/:score'],
    categories: ['social-media'],
    example: '/douban/movie/playing',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '正在上映的电影',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const score = Number.parseFloat(ctx.req.param('score')) || 0;
    const response = await got({
        method: 'get',
        url: `https://movie.douban.com/cinema/nowplaying/beijing`,
    });
    const $ = load(response.data);

    return {
        title: `正在上映的${score ? `超过 ${score} 分的` : ''}电影`,
        link: `https://movie.douban.com/cinema/nowplaying/`,
        item: $('.list-item')
            .toArray()
            .map((i) => {
                const item = $(i);
                const itemScore = Number.parseFloat(item.attr('data-score')) || 0;
                return itemScore >= score
                    ? {
                          title: item.attr('data-title'),
                          description: `标题：${item.attr('data-title')}<br>评分：${itemScore}<br>片长：${item.attr('data-duration')}<br>制片国家/地区：${item.attr('data-region')}<br>导演：${item.attr(
                              'data-director'
                          )}<br>主演：${item.attr('data-actors')}<br><img src="${item.find('.poster img').attr('src')}">`,
                          link: `https://movie.douban.com/subject/${item.attr('id')}`,
                      }
                    : null;
            })
            .filter(Boolean),
        allowEmpty: true,
    };
}
