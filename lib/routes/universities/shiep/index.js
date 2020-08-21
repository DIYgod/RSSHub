const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const config = {
        news: {
            title: '新闻网',
            url: 'http://news.shiep.edu.cn/notice/list.htm',
        },
        energy: {
            title: '能机学院',
            url: 'https://energy.shiep.edu.cn/894/list.htm',
        },
        hhxy: {
            title: '环化学院',
            url: 'https://hhxy.shiep.edu.cn/1231/list.htm',
        },
        dqxy: {
            title: '电气学院',
            url: 'https://dqxy.shiep.edu.cn/2462/list.htm',
        },
        zdhxy: {
            title: '自动化学院',
            url: 'https://zdhxy.shiep.edu.cn/2002/list.htm',
        },
        jsjxy: {
            title: '计算机学院',
            url: 'https://jsjxy.shiep.edu.cn/973/list.htm',
        },
        dxxy: {
            title: '电信学院',
            url: 'https://dxxy.shiep.edu.cn/3404/list.htm',
        },
        jgxy: {
            title: '经管学院',
            url: 'https://jgxy.shiep.edu.cn/3633/list.htm',
        },
        slxy: {
            title: '数理学院',
            url: 'https://slxy.shiep.edu.cn/2063/list.htm',
        },
        wgyxy: {
            title: '外国语学院',
            url: 'https://wgyxy.shiep.edu.cn/tzgg/list.htm',
        },
        gjjlxy: {
            title: '国交学院',
            url: 'https://gjjlxy.shiep.edu.cn/tzgg/list.htm',
        },
        jjxy: {
            title: '继续教育学院',
            url: 'https://jjxy.shiep.edu.cn/2582/list.htm',
        },
        skb: {
            title: '马院',
            url: 'https://skb.shiep.edu.cn/1736/list.htm',
        },
        tyb: {
            title: '体育部',
            url: 'https://tyb.shiep.edu.cn/2891/list.htm',
        },
        yjzx: {
            title: '艺教中心',
            url: 'https://yjzx.shiep.edu.cn/3089/list.htm',
        },
    };

    const type = ctx.params.type;

    const response = await got({
        method: 'get',
        url: config[type].url,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div[class="fields pr_fields"]');

    ctx.state.data = {
        title: '上海电力大学-' + config[type].title,
        link: config[type].url,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').text(),
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
