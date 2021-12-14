const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const site = ctx.params.site === 'r18' ? 'r18' : '';
    const grouping = ctx.params.grouping === 'tag' ? 'tag' : 'category';
    const name = ctx.params.name;

    const url = `https://${site ? 'r18.' : ''}clickme.net/${grouping.slice(0, 1)}/${encodeURIComponent(name)}`;

    const response = await got({
        method: 'post',
        url: 'https://api.clickme.net/article/list?key=clickme',
        headers: {
            Referer: url,
        },
        form: {
            articleType: site ? 'r18' : 'article',
            subtype: grouping,
            subtypeSlug: name,
            device: '',
            limit: 10,
            page: 1,
        },
    });

    const category_name = name === 'new' ? '最新' : response.data.data.items[0].categoryName[0].name;
    const displayed_name = grouping === 'tag' ? name : category_name;

    const list = response.data.data.items;

    const parseContent = (htmlString) => {
        const $ = cheerio.load(htmlString);
        const content = $('.article-detail-content');
        return {
            description: content.html(),
        };
    };

    const out = await Promise.all(
        list.map(async (item) => {
            const link = item.url;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const rssitem = {
                title: item.title,
                link,
                author: item.userNick,
                pubDate: new Date(item.date * 1000),
            };

            try {
                const response = await got.get(link);
                const result = parseContent(response.data);
                if (!result.description) {
                    return Promise.resolve('');
                }
                rssitem.description = result.description;
            } catch (err) {
                return Promise.resolve('');
            }
            ctx.cache.set(link, JSON.stringify(rssitem));
            return Promise.resolve(rssitem);
        })
    );

    ctx.state.data = {
        title: `ClickMe ${site ? 'R18 ' : ''}- ${displayed_name}`,
        link: url,
        item: out.filter((item) => item !== ''),
    };
};
