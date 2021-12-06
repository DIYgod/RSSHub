const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const url = 'https://www.zcool.com.cn/top/index.do';

    const topResponse = await got({
        method: 'get',
        url,
        header: {
            Referer: 'https://www.zcool.com.cn',
        },
    });

    let $ = cheerio.load(topResponse.data);
    const rankId = $('div.list-cycle>p>span').text();

    if (type === 'article') {
        const articleResponse = await got({
            method: 'get',
            url: 'https://www.zcool.com.cn/top/article.do?rankType=8&rankId=' + rankId,
            header: {
                Referer: url,
            },
        });
        $ = cheerio.load(articleResponse.data);
    }

    const list = $('div.author')
        .map((i, e) => {
            const element = $(e);

            const title = element.find('div.title').find('a').text();
            const link = element.find('div.title').find('a').attr('href');
            const author = element.find('div.nick').find('a').text();

            return {
                title,
                description: '',
                link,
                author,
            };
        })
        .get();

    const result = await Promise.all(
        list.map(async (item) => {
            const link = item.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemResponse = await got({
                method: 'get',
                url: link,
                header: {
                    Referer: url,
                },
            });
            const itemElement = cheerio.load(itemResponse.data);
            item.description = type !== 'article' ? itemElement('div.work-content-wrap').html() : itemElement('div.article-content-wraper').html();
            ctx.cache.set(link, JSON.stringify(item));
            return item;
        })
    );

    ctx.state.data = {
        title: '站酷 - 第' + rankId + '期' + (type !== 'article' ? '作品总榜' : '文章总榜'),
        link: url,
        item: result,
    };
};
