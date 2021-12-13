const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

//新闻
let host = 'https://www.ceic.com/gjnyjtww/chnxwzx/cnhxwzx.shtml';
let citytitle = '国家能源集团';

module.exports = async (ctx) => {

  if (ctx.params.type === 'yw') {
    host = 'https://www.ceic.com/gjnyjtww/chnjtyw/chnlist.shtml';
    citytitle = '集团要闻';

    const response = await got.get(host);
    const $ = cheerio.load(response.data);
    
    const list = $('.jcxw_t').get();
    
    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').text();
            //有2个a,第2个才是链接
            const itemUrl = url.resolve(host, $('a').eq(1).attr('href'));

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const res = await got.get(itemUrl);
            const capture = cheerio.load(res.data);
            const contents = capture('.content_l').html();
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

  } else {
        host =  'https://www.ceic.com/gjnyjtww/chnxwzx/cnhxwzx.shtml';
        citytitle = '集团综合新闻';

    const response = await got.get(host);
    const $ = cheerio.load(response.data);
    
    const list = $('.jcxw_t').get();
    
    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').text();
            //有2个a,第2个才是链接
            const itemUrl = url.resolve(host, $('a').eq(1).attr('href'));

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const res = await got.get(itemUrl);
            const capture = cheerio.load(res.data);
            const contents = capture('.content_l').html();
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

  }
 
};
