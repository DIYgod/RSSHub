const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const base_url = 'http://www.cnca.gov.cn/xxgk/hydt/';
    const response = await got.get(base_url);
    const $ = cheerio.load(response.data);
    const list = $('.liebiao li').get();

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        const content = $('.TRS_Editor p');
        return content.text();
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('a');
            let link = $a.attr('href');
            if (link.startsWith('.')) {
                link = base_url + link;
            }

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: link,
            });

            const single = {
                title: $a.text(),
                description: ProcessFeed(response.data),
                pubDate: $('span').html(),
                link,
            };

            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '中国国家认证认可监管管理员会',
        link: 'http://www.cnca.gov.cn/',
        description: '行业动态',
        item: items,
    };
};
