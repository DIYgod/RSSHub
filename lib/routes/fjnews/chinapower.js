const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

//发电
let host = 'http://www.chinapower.com.cn/fd/';
let citytitle = '电力网发电新闻';

module.exports = async (ctx) => {

    const response = await got.get(host);
    const $ = cheerio.load(response.data);
    
    const list = $('LI.headlinelist').get();
    
    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').attr('title');
            //有2个a,第2个才是链接
            const itemUrl = url.resolve(host, $('a').attr('href'));

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const res = await got.get(itemUrl);
            const capture = cheerio.load(res.data);
            const contents = capture('.content').html();
            //const time = capture('div.col-xs-8').text().substring(0, 19);

            const single = {
                title,
                link: itemUrl,
                guid: itemUrl,
                description: contents,
                //pubDate: new Date(time).toUTCString(),
            };

            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: citytitle,
        link: host,
        item: out,
    };


};
