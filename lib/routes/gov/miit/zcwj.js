const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const base_url = 'http://www.miit.gov.cn/n1146295/n1652858/';
    const response = await got.get(base_url);
    const $ = cheerio.load(response.data);
    const list = $('.clist_con li').get();

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        const content = $('p');
        return content.text();
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('a');
            let link = $a.attr('href');
            if (link.startsWith('..')) {
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
                link,
            };

            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '中国工业化和信息部',
        link: 'http://www.miit.gov.cn',
        description: '政策文件',
        item: items,
    };
};
