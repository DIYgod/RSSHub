const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

const legacyUrls = {
    1: '/yaowen/dashi',
    2: '/yaowen/hfggzc',
    3: '/jinrong/zhengquan',
    4: '/jinrong/ziben',
    5: '/jinrong/licai',
    6: '/shangye/xinnengyuan',
    7: '/shangye/yiliao',
    8: '/fcqcxf/dichan',
    9: '/fcqcxf/qiche',
    10: '/fcqcxf/xiaofei',
    11: '/yule/yingshi',
    12: '/yule/yule',
    13: '/yule/tiyu',
    14: '/yule/jiaoyu',
    15: '/gcj/guanchajia',
    16: '/gcj/zhuanlan',
    17: '/gcj/shuping',
    18: '/gcj/lishi',
    19: '/yaowen/hfshuju',
};

module.exports = async (ctx) => {
    const column = ctx.params.column || 'shangyechanye';
    const category = ctx.params.category || '';

    const rootUrl = 'http://www.eeo.com.cn';
    let currentUrl = rootUrl;

    if (parseInt(column)) {
        currentUrl += legacyUrls[parseInt(column)];
    } else {
        currentUrl += `/${column}/${category}`;
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('#lyp_article li div span a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            return {
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    content('.xd-xd-xd-rwm, .xd_zuozheinfo, .xd-lj, .xd-gg').remove();

                    item.title = content('h1').text();
                    item.description = content('.xd-nr').html();
                    item.pubDate = timezone(new Date(content('.thiszihao-box-add').nextUntil('.cls').find('span').eq(0).text()), +8);

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').text().replace('_', ' - '),
        link: currentUrl,
        item: items,
        description: '经济观察网是《经济观察报》社倾力制作的全新商业资讯平台，经济观察网冷静理智的报道风格，并糅合最新的网络技术，拥有专业的采编力量以及独家的新闻报道，为您提供及时、便捷、专业的信息服务。',
    };
};
