const got = require('@/utils/got');

module.exports = async (ctx) => {
    const sort = ctx.params.sort || 'U';
    const score = parseFloat(ctx.params.score) || 0;
    const tags = ctx.params.tags || '';

    const response = await got({
        method: 'get',
        url: `https://movie.douban.com/j/new_search_subjects?sort=${sort}&range=0,10&tags=${tags}&start=0`,
    });

    const movies = response.data.data;

    ctx.state.data = {
        title: `豆瓣电影分类${score ? `超过 ${score} 分的` : ''}影视`,
        link: `https://movie.douban.com/tag/#/?sort=U&range=0,10&tags=`,
        item: movies
            .map((item) => {
                const itemScore = parseFloat(item.rate) || 0;

                if (itemScore >= score) {
                    return {
                        title: item.title,
                        description: `标题：${item.title}<br>
                        评分：${item.rate}<br>
                        导演：${item.directors.join(' / ')}<br>
                        主演：${item.casts.join(' / ')}<br>
                        <img src="${item.cover}">`,
                        link: item.url,
                    };
                } else {
                    return null;
                }
            })
            .filter((item) => item),
    };
    ctx.state.data.allowEmpty = true;
};
