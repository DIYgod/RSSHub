const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

//发电
let citytitle = '电力网发电新闻';

module.exports = async (ctx) => {

   //电力网,如基层动态的type为jcdt, http://mm.chinapower.com.cn/fd/jcdt/
    const host = 'http://mm.chinapower.com.cn/fd/' + ctx.params.type;

    const response = await got.get(host);
    const $ = cheerio.load(response.data);
    
    const list = $('div.small').get();
    
    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').text();
            //有2个a,第1个才是链接
            const itemUrl = url.resolve(host, $('a').attr('href'));

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const res = await got.get(itemUrl);
            const capture = cheerio.load(res.data);
            const contents = capture('div.content').html();
            const author = capture('div.info').text().replace('发布时间：','').replace('作者：','');

            //const time = capture('div.col-xs-8').text().substring(0, 19);

            const single = {
                title,
                link: itemUrl,
                guid: itemUrl,
                author,
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
