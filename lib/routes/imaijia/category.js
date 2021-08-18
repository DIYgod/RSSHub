const got = require('@/utils/got');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    const api_url = `http://www.imaijia.com/xstb/front/authorArticleController.do?indexArticles&pageSize=20`;
    const url = `http://www.imaijia.com/#/information.htm?catid=${category}`;

    const response = await got({
        method: 'post',
        headers: {
            Referer: url,
        },
        url: api_url,
        form: {
            pageNo: 1,
            catid: `${category}`,
        },
    });

    const data = response.data;
    const description = data.description;
    const name = data.catName;
    const list = data.resList;

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const cat_path = info.catPath;
            const id = info.id;
            const itemUrl = `http://www.imaijia.com/#/atricleDetails.htm?atricleId=${id}&catPath=${cat_path}`;
            const api_url = `http://www.imaijia.com/data/details/${cat_path}${id}.json`;
            const pubDate = info.created;
            const author = info.author;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(api_url);

            const description = response.data.resList.articleDataF.content.replace(/src="/g, 'src="http://www.imaijia.com');

            const single = {
                title,
                link: itemUrl,
                author,
                description,
                pubDate: new Date(pubDate).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `电商在线-${name}`,
        description,
        link: url,
        item: out,
    };
};
