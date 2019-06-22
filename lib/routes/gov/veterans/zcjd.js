const axios = require('@/utils/got');
const host = 'http://www.mva.gov.cn/jiedu/zcjd/';
const cheerio = require('cheerio');
async function load(link, ctx) {
    const cache = await ctx.cache.get(link);
    if (cache) {
        return cache;
    }

    const response = await axios.get(link);
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
    await ctx.cache.set(link, description);
    return {
        description,
        link: link,
        pubDate: pubDate,
        author: author,
    };
}

module.exports = async (ctx) => {
    const page = host;
    const response = await axios({
        method: 'get',
        url: page,
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('#main > div.overview.container.clearfix > div.overview-right.fr > div > div.public_list_team > ul > li  > a').get();

    const process = await Promise.all(
        list.map(async (item) => {
            let itemUrl = $(item).attr('href');
            if (itemUrl.indexOf('./') === 0) {
                itemUrl = host + itemUrl.substring(2);
            }
            const single = {
                title: $(item).text(),
                link: itemUrl,
                guid: itemUrl,
            };
            const other = await load(String(itemUrl), ctx);
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
    ctx.state.data = {
        title: `中华人民共和国退役军人事务部 - 政策解读`,
        link: `http://www.mva.gov.cn/sy/xx/bnxx`,
        description: `中华人民共和国退役军人事务部-政策解读更新提示`,
        item: process,
    };
};
