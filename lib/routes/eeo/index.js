const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '观察家';
    const category_url_relation = {
        '01': 'http://www.eeo.com.cn/yaowen/dashi/',
        '02': 'http://www.eeo.com.cn/yaowen/hfggzc/',
        '03': 'http://www.eeo.com.cn/jinrong/zhengquan/',
        '04': 'http://www.eeo.com.cn/jinrong/ziben/',
        '05': 'http://www.eeo.com.cn/jinrong/licai/',
        '06': 'http://www.eeo.com.cn/shangye/xinnengyuan/',
        '07': 'http://www.eeo.com.cn/shangye/yiliao/',
        '08': 'http://www.eeo.com.cn/fcqcxf/dichan/',
        '09': 'http://www.eeo.com.cn/fcqcxf/qiche/',
        10: 'http://www.eeo.com.cn/fcqcxf/xiaofei/',
        11: 'http://www.eeo.com.cn/yule/yingshi/',
        12: 'http://www.eeo.com.cn/yule/yule/',
        13: 'http://www.eeo.com.cn/yule/tiyu/',
        14: 'http://www.eeo.com.cn/yule/jiaoyu/',
        15: 'http://www.eeo.com.cn/gcj/guanchajia/',
        16: 'http://www.eeo.com.cn/gcj/zhuanlan/',
        17: 'http://www.eeo.com.cn/gcj/shuping/',
        18: 'http://www.eeo.com.cn/gcj/lishi/',
        19: 'http://www.eeo.com.cn/yaowen/hfshuju/',
    };

    const response = await got({
        method: 'get',
        url: category_url_relation[category],
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('#lyp_article li').get();
    const result = list.map((item) => ({
        title: $(item).find('div span a').text(),
        description: $(item).find('div p').text(),
        pubDate: new Date().toUTCString(),
        link: $(item).find('>a').attr('href'),
    }));
    ctx.state.data = {
        title: '经济观察网',
        link: 'http://www.eeo.com.cn',
        description: '经济观察网是《经济观察报》社倾力制作的全新商业资讯平台',
        item: result,
    };
};
