const got = require('@/utils/got');
const host = 'http://www.mva.gov.cn';
const cheerio = require('cheerio');
async function load(link, ctx) {
    const cache = await ctx.cache.get(link);
    if (cache) {
        return cache;
    }

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const introduce = $('#div_zhengwen > div').html();
    const temp = $('#main > div.outerlayer > div > div > div.article-info').text();
    // 格式化输出时间
    const dateTime =
        temp
            .substring(3, 20)
            .replace('年', '-')
            .replace('月', '-')
            .replace('日', '') + ':00';

    const pubDate = new Date(new Date(dateTime).getTime()).toUTCString();

    const author = temp.substring(24, temp.indexOf('分享到'));

    const detailResult = `${introduce}`;

    // 定义description,并指定内容
    const description = detailResult;
    ctx.cache.set(link, description);
    return {
        description,
        link: link,
        pubDate: pubDate,
        author: author,
    };
}

module.exports = async (ctx) => {
    const page = host;
    const response = await got({
        method: 'get',
        url: page,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('#whTopSlide > div.bd > ul > li > a').get();

    const process = await Promise.all(
        list.map(async (item) => {
            let itemUrl = $(item).attr('href');
            if (itemUrl.indexOf('./') === 0) {
                itemUrl = host + itemUrl.substring(1);
            } else if (itemUrl.indexOf('/') === 0) {
                itemUrl = host + itemUrl;
            }
            const single = {
                title: $(item).attr('title'),
                link: itemUrl,
                guid: itemUrl,
            };
            const other = await load(String(itemUrl), ctx);
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
    ctx.state.data = {
        title: `中华人民共和国退役军人事务部 - 首页信息`,
        link: `http://www.mva.gov.cn`,
        description: `中华人民共和国退役军人事务部-首页信息更新提示`,
        item: process,
    };
};
