const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const logger = require('@/utils/logger');

let host = 'http://news.fznews.com.cn/fzxw/';
let citytitle='福州新闻';  //根据选择显示不同的rss标题

module.exports = async (ctx) => {
	//外部传入的参数
	if (ctx.params.city === 'fj') {
           host = 'http://news.fznews.com.cn/dsxw/';
	   citytitle='福建新闻';
    	}else{
           host = 'http://news.fznews.com.cn/fzxw/';
	   citytitle='福州新闻';
	}

    const response = await got.get(host);

    const $ = cheerio.load(response.data);

    const list = $('.li-h32f14 li:not(.clearfix)').slice(0, ctx.params.limit).get(); //取最新30条


    const out = await Promise.all(

        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').text();
            const itemUrl = url.resolve(host, $('a').attr('href'));

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }


             const res = await got.get(itemUrl);
            const capture = cheerio.load(res.data);
            const contents = capture('.zhengwen').html();
            const time = capture('div.laiyuan div.left').text().substring(0,19);
            const author = capture('.laiyuan').text().replace('分享到：', ''); //替换


            const single = {
                title,
                link: itemUrl,
                guid: itemUrl,
                author: author,
                
                //more data                
                description: contents,
                pubDate: new Date(time).toUTCString(),

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
