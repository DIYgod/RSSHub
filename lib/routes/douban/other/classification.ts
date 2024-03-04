// @ts-nocheck
import got from '@/utils/got';

export default async (ctx) => {
    const sort = ctx.req.param('sort') || 'U';
    const score = Number.parseFloat(ctx.req.param('score')) || 0;
    const tags = ctx.req.param('tags') || '';

    const response = await got({
        method: 'get',
        url: `https://movie.douban.com/j/new_search_subjects?sort=${sort}&range=0,10&tags=${tags}&start=0`,
    });

    const movies = response.data.data;

    ctx.set('data', {
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
    });
};
