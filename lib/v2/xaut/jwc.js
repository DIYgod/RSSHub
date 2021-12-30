const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let category = ctx.params.category;
    const rootUrl = 'http://jwc.xaut.edu.cn/';
    const dic_html = { tzgg: 'tzgg.htm', xwdt: 'xwdt.htm', gzzd: 'gzzd.htm', jggs: 'xkjs/jggs.htm', jsjg: 'xkjs/jsjg.htm', jsxx: 'xkjs/jsxx.htm', gkgs: 'gkgs.htm' };
    const dic_title = { tzgg: '通知公告', xwdt: '新闻动态', gzzd: '规章制度', jggs: '竞赛结果公示', jsjg: '竞赛获奖通知', jsxx: '竞赛信息', gkgs: '公开公示' };

    // 设置默认值
    if (dic_title[category] === undefined) {
        category = 'tzgg';
    }

    const response = await got({
        method: 'get',
        url: rootUrl + dic_html[category],
        headers: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
        },
    });
    const data = response.body;
    const $ = cheerio.load(data);

    const list = $('.main_conRCb a')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            const link = item
                .attr('href')
                .replace(/^\.\./, rootUrl)
                .replace(/^(info)/, rootUrl + 'info');
            return {
                title: item.find('em').text(),
                link,
                pubDate: new Date(item.find('span').text()),
            };
        })
        .get();

    ctx.state.data = {
        // 源标题
        title: '西安理工大学教务处-' + dic_title[category],
        // 源链接
        link: rootUrl,
        // 源说明
        description: `西安理工大学教务处-` + dic_title[category],
        // 遍历此前获取的数据
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    if (!item.link.match('zhixing.xaut.edu.cn') && !item.link.match('xinwen.xaut.edu.cn')) {
                        item.description = item.title;
                    } else {
                        item.description = '请在校内或校园VPN内查看内容';
                    }
                    return item;
                })
            )
        ),
    };
};
