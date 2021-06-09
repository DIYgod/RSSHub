const got = require('@/utils/got');
const cheerio = require('cheerio');

const categories = {
    0: '全部行业',
    10: '移动视频',
    1: '移动社交',
    2: '移动购物',
    17: '系统工具',
    21: '新闻资讯',
    11: '移动音乐',
    5: '生活服务',
    16: '数字阅读',
    4: '汽车服务',
    12: '拍摄美化',
    8: '旅游服务',
    22: '健康美容',
    23: '医疗服务',
    14: '教育学习',
    3: '金融理财',
    9: '办公商务',
    19: '智能设备',
    20: '手机游戏',
    26: '出行服务',
    29: '内容平台',
};

const labels = {
    0: '全部标签',
    75: '5G',
    74: '双十一',
    73: '直播带货',
    72: '电商平台',
    71: '新蓝领',
    70: '市场竞争',
    69: 'KOL',
    68: '品牌营销',
    67: '互联网研究',
    66: '广告效果',
    65: '媒介策略',
    64: 'App和小程序',
    63: 'App增长',
    62: '小程序数据',
    61: '移动大数据',
    60: '互联网报告',
    59: '数据报告',
    58: '互联网数据',
    57: '智能终端',
    56: '小程序',
    55: '私域流量',
    54: '运动消费',
    53: '用户争夺',
    52: '运动健身',
    48: '新消费',
    42: '增长模式',
    41: '下沉',
    36: '新中产',
    31: '银发族',
    30: '粉丝经济',
    29: '泛娱乐',
    28: '网购少女',
    27: '二次元',
    26: '兴趣圈层',
    25: '大学生',
    23: '广告营销',
    22: 'Z世代',
    18: '付费用户',
    17: '精细化运营',
    14: '00后',
    11: '90后',
    10: '春节报告',
    9: '低幼经济',
    7: '季度报告',
    6: '年度报告',
    5: '全景生态',
    2: '消费者洞察',
};

module.exports = async (ctx) => {
    const category = ctx.params.category || '0';
    const label = ctx.params.label || '0';

    const rootUrl = 'https://www.questmobile.com.cn';
    const currentUrl = `${rootUrl}/api/v1/research/reports?categoryId=${category}&labelId=${label}&version=0&currentPage=1&limit=15`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.data.map((item) => ({
        title: item.title,
        pubDate: Date.parse(item.publishTime),
        link: `${rootUrl}/research/report-new/${item.id}/`,
    }));

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    content('img[_ngcontent-c11]').each(function () {
                        content(this).attr('alt', '');
                    });

                    item.description = content('.text').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${categories[category]}, ${labels[label]} - 行业研究报告 - QuestMobile`,
        link: currentUrl,
        item: items,
    };
};
