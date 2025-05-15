import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/movie/classification/:sort?/:score?/:tags?',
    categories: ['social-media'],
    example: '/douban/movie/classification/R/7.5/Netflix,2020',
    parameters: { sort: '排序方式，默认为U', score: '最低评分，默认不限制', tags: '分类标签，多个标签之间用英文逗号分隔，常见的标签到豆瓣电影的分类页面查看，支持自定义标签' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '豆瓣电影分类',
    maintainers: ['zzwab'],
    handler,
    description: `排序方式可选值如下

| 近期热门 | 标记最多 | 评分最高 | 最近上映 |
| -------- | -------- | -------- | -------- |
| U        | T        | S        | R        |`,
};

async function handler(ctx) {
    const sort = ctx.req.param('sort') || 'U';
    const score = Number.parseFloat(ctx.req.param('score')) || 0;
    const tags = ctx.req.param('tags') || '';

    const response = await got({
        method: 'get',
        url: `https://movie.douban.com/j/new_search_subjects?sort=${sort}&range=0,10&tags=${tags}&start=0`,
    });

    const movies = response.data.data;

    return {
        title: `豆瓣电影分类${score ? `超过 ${score} 分的` : ''}影视`,
        link: `https://movie.douban.com/tag/#/?sort=U&range=0,10&tags=`,
        item: movies
            .map((item) => {
                const itemScore = Number.parseFloat(item.rate) || 0;

                return itemScore >= score
                    ? {
                          title: item.title,
                          description: `标题：${item.title}<br>
                        评分：${item.rate}<br>
                        导演：${item.directors.join(' / ')}<br>
                        主演：${item.casts.join(' / ')}<br>
                        <img src="${item.cover}">`,
                          link: item.url,
                      }
                    : null;
            })
            .filter(Boolean),
        allowEmpty: true,
    };
}
