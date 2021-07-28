const got = require('@/utils/got');
const cheerio = require('cheerio');
async function load(link, ctx) {
    return await ctx.cache.tryGet(link, async () => {
        // 开始加载页面
        const response = await got.get(link);
        const $ = cheerio.load(response.data);
        // Title
        const title = $('#main > div.outerlayer > div > div > h2 > p').text();
        // 正文
        const introduce = $('#div_zhengwen > div').html();
        // 临时参数，用以获取作者和推送时间
        const temp = $('#main > div.outerlayer > div > div > div.article-info').text();
        // 格式化输出时间
        const dateTime =
            temp
                .substring(temp.indexOf('时间：') + 3, temp.indexOf('来源：'))
                .trim()
                .replace('年', '-')
                .replace('月', '-')
                .replace('日', '') + ':00';
        // 转为标准时间
        const pubDate = new Date(new Date(dateTime).getTime()).toUTCString();
        // 作者
        const author = temp.substring(24, temp.indexOf('分享到'));

        return {
            title: title,
            description: introduce,
            link: link,
            pubDate: pubDate,
            author: author,
        };
    });
}

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const checkType = {
        bnxx: '部内信息',
        index: '首页新闻',
        zcjd: '政策解读',
    };
    const page = type === 'bnxx' ? `http://www.mva.gov.cn/sy/xx/bnxx/` : type === 'zcjd' ? `http://www.mva.gov.cn/jiedu/zcjd/` : `http://www.mva.gov.cn/`;
    const response = await got({
        method: 'get',
        url: page,
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const list = type === 'index' ? $('#whTopSlide > div.bd > ul > li > a').get() : $('#main > div.overview.container.clearfix > div.overview-right.fr > div > div.public_list_team > ul > li  > a').get();

    const process = await Promise.all(
        list.map(async (item) => {
            let itemUrl = $(item).attr('href');
            if (itemUrl.indexOf('./') === 0) {
                itemUrl = page + itemUrl.substring(2);
            } else if (itemUrl.indexOf('/') === 0) {
                itemUrl = page + itemUrl;
            }
            const single = {
                link: itemUrl,
                guid: itemUrl,
            };
            const other = await load(String(itemUrl), ctx);
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
    ctx.state.data = {
        title: `中华人民共和国退役军人事务部 - ${checkType[type]}`,
        link: page,
        description: `中华人民共和国退役军人事务部 - ${checkType[type]} 更新提示`,
        item: process,
    };
};
