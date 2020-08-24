const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const config = {
        news: {
            title: '新闻网',
            url: 'notice',
        },
        energy: {
            title: '能机学院',
            url: '894',
        },
        hhxy: {
            title: '环化学院',
            url: '1231',
        },
        dqxy: {
            title: '电气学院',
            url: '2462',
        },
        zdhxy: {
            title: '自动化学院',
            url: '2002',
        },
        jsjxy: {
            title: '计算机学院',
            url: '973',
        },
        dxxy: {
            title: '电信学院',
            url: '3404',
        },
        jgxy: {
            title: '经管学院',
            url: '3633',
        },
        slxy: {
            title: '数理学院',
            url: '2063',
        },
        wgyxy: {
            title: '外国语学院',
            url: 'tzgg',
        },
        gjjlxy: {
            title: '国交学院',
            url: 'tzgg',
        },
        jjxy: {
            title: '继续教育学院',
            url: '2582',
        },
        skb: {
            title: '马院',
            url: '1736',
        },
        tyb: {
            title: '体育部',
            url: '2891',
        },
        yjzx: {
            title: '艺教中心',
            url: '3089',
        },
    };

    const link = config[type].url;

    const { data } = await got({
        method: 'get',
        url: `https://${type}.shiep.edu.cn/${link}/list.htm`,
    });

    const $ = cheerio.load(data);
    const list = $('div[class="fields pr_fields"]');

    ctx.state.data = {
        title: '上海电力大学-' + config[type].title,
        link: `https://${type}.shiep.edu.cn/${link}/list.htm`,
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
