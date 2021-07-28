const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = 'http://www.csrc.gov.cn/pub/zjhpublic/3300/3621/index_7401.htm';
    const ori_url = 'http://www.csrc.gov.cn/pub/zjhpublic/';
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.row').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('li.fbrq').text();
            const title = $('li.mc > div').text();
            const sub_url = $('li.mc > div').find('a').attr('href').slice(6);
            const itemUrl = ori_url + sub_url;
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const responses = await got.get(itemUrl);
            const $d = cheerio.load(responses.data);

            const single = {
                title,
                pubDate: new Date(time).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
                description: $d('#ContentRegion .Custom_UnionStyle').html(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
