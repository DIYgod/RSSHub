const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const cookie = config.miit.miit_cookie;
    const base_url = 'https://www.miit.gov.cn/zwgk/wjgs/index.html';
    const index_url = 'https://www.miit.gov.cn/'
    const response = await got({
        method: 'get',
        url: base_url,
        headers: {
            Cookie: cookie,
        },     
    });
    const $ = cheerio.load(response.data);
    const list = $('.clist_con li').get();

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        const content = $('p');
        return content.html();
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('a');
            let link = $a.attr('href');
            link = index_url + link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: link,
                headers: {
                    Cookie: cookie,
                },                
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
        description: '文件公示',
        item: items,
    };
};
}
