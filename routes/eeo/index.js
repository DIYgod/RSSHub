const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '观察家';
    const category_url_relation = {
        时事: 'http://www.eeo.com.cn/yaowen/dashi/',
        政策: 'http://www.eeo.com.cn/yaowen/hfggzc/',
        宏观: 'http://www.eeo.com.cn/yaowen/hfshuju/',
        证券: 'http://www.eeo.com.cn/jinrong/zhengquan/',
        资本: 'http://www.eeo.com.cn/jinrong/ziben/',
        理财: 'http://www.eeo.com.cn/jinrong/licai/',
        新科技: 'http://www.eeo.com.cn/shangye/xinnengyuan/',
        大健康: 'http://www.eeo.com.cn/shangye/yiliao/',
        房产: 'http://www.eeo.com.cn/fcqcxf/dichan/',
        汽车: 'http://www.eeo.com.cn/fcqcxf/qiche/',
        消费: 'http://www.eeo.com.cn/fcqcxf/xiaofei/',
        影视: 'http://www.eeo.com.cn/yule/yingshi/',
        娱乐: 'http://www.eeo.com.cn/yule/yule/',
        体育: 'http://www.eeo.com.cn/yule/tiyu/',
        教育: 'http://www.eeo.com.cn/yule/jiaoyu/',
        观察家: 'http://www.eeo.com.cn/gcj/guanchajia/',
        专栏: 'http://www.eeo.com.cn/gcj/zhuanlan/',
        书评: 'http://www.eeo.com.cn/gcj/shuping/',
        个人历史: 'http://www.eeo.com.cn/gcj/lishi/',
    };

    const response = await axios({
        method: 'get',
        url: category_url_relation[category],
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('#lyp_article li').get();
    const result = list.map((item) => ({
        title: $(item)
            .find('div span a')
            .text(),
        description: $(item)
            .find('div p')
            .text(),
        pubDate: new Date().toUTCString(),
        link: $(item)
            .find('>a')
            .attr('href'),
    }));
    ctx.state.data = {
        title: '经济观察网',
        link: 'http://www.eeo.com.cn',
        description: '经济观察网是《经济观察报》社倾力制作的全新商业资讯平台',
        item: result,
    };
};
