const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

const types = {
    hot: '热门',
    recommend: '推荐',
    recent: '最新',
};

module.exports = async (ctx) => {
    const type = ctx.params.type ? ctx.params.type : 'hot';
    const category = ctx.params.category ? ctx.params.category : '0';
    const category_name = category === '0' ? '全部' : category;

    const url = `http://www.cnu.cc/discoveryPage/${type}-${encodeURIComponent(category)}`;

    const list_response = await got.get(url);
    const $ = cheerio.load(list_response.data);

    const list = $('.grid-item.work-thumbnail').toArray();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.title');
            const link = $('a.thumbnail').attr('href');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const rssitem = {
                title: title.text().trim(),
                link,
            };

            try {
                const response = await got.get(link);
                const result = utils.parseContent(response.data);

                rssitem.author = result.author;
                rssitem.description = result.description;
                rssitem.pubDate = result.pubDate;
            } catch (err) {
                return Promise.resolve('');
            }
            ctx.cache.set(link, JSON.stringify(rssitem));
            return Promise.resolve(rssitem);
        })
    );

    ctx.state.data = {
        title: `CNU视觉联盟 - ${types[type]} - ${category_name}`,
        link: url,
        item: out.filter((item) => item !== ''),
    };
};
