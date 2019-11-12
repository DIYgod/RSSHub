const got = require('@/utils/got');
const utils = require('./utils');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const listRes = await got({
        method: 'get',
        url: `https://zhuanlan.zhihu.com/api/columns/${id}/articles`,
        headers: {
            ...utils.header,
            Referer: `https://zhuanlan.zhihu.com/${id}`,
        },
    });
    const infoRes = await got({
        method: 'get',
        url: `https://zhuanlan.zhihu.com/api/columns/${id}`,
        headers: {
            ...utils.header,
            Referer: `https://zhuanlan.zhihu.com/${id}`,
        },
    });

    if (listRes.status === 403) {
        throw 'list resource api returned status code ' + listRes.status;
    }

    if (infoRes.status === 403) {
        throw 'info resource api returned status code ' + infoRes.status;
    }

    const list = listRes.data.data;
    const info = infoRes.data;

    const articles = await Promise.all(
        list.map(async (article) => {
            const url = article.url;
            const item = {
                title: article.title,
                description: '',
                pubDate: new Date(article.updated * 1000).toUTCString(),
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

    if (!Array.isArray(list)) {
        throw JSON.stringify(list);
    }

    ctx.state.data = {
        title: `知乎专栏-${info.title}`,
        link: `https://zhuanlan.zhihu.com/${id}`,
        description: info.description,
        item: articles,
        // list.map((item) => ({
        //     title: item.title,
        //     description: item.content.replace(/ src="/g, ' src="https://pic4.zhimg.com/'),
        //     pubDate: new Date(item.publishedTime).toUTCString(),
        //     link: `https://zhuanlan.zhihu.com${item.url}`,
        // })),
    };
};
