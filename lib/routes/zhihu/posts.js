const got = require('@/utils/got');
const utils = require('./utils');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `https://www.zhihu.com/api/v4/members/${id}/articles?limit=5`,
        headers: {
            ...utils.header,
            Referer: `https://www.zhihu.com/people/${id}/posts`,
            Authorization: 'oauth c3cef7c66a1843f8b3a9e6a1e3160e20', // hard-coded in js
        },
    });

    const data = response.data.data;

    const articles = await Promise.all(
        data.map(async (article) => {
            const url = article.url;
            const item = {
                title: article.title,
                description: '',
                link: article.url,
            };
            const key = 'zhuanlan' + article.url;
            const value = await ctx.cache.get(key);

            if (value) {
                item.description = value;
            } else {
                const articleOriginal = await got({
                    method: 'get',
                    url: url,
                    headers: {
                        Referer: url,
                    },
                });

                const articleContent = cheerio
                    .load(articleOriginal.data)('.Post-RichText')
                    .html();

                if (articleContent !== null) {
                    item.description = utils.ProcessImage(articleContent);
                } else {
                    item.description = utils.ProcessImage(
                        cheerio
                            .load(articleOriginal.data)('.PostIndex-warning')
                            .html()
                    );
                }

                ctx.cache.set(key, item.description);
            }

            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `${data[0].author.name}的知乎文章`,
        link: `https://www.zhihu.com/people/${id}/posts`,
        description: data[0].author.headline || data[0].author.description,
        item: articles,
    };
};
