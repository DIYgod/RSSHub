const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let category = ctx.params.category;
    const dic_html = { tzgg: 'tzgg.htm', xyyw: 'xyyw.htm', mtbd: 'mtbd1.htm', xshd: 'xshd.htm' };
    const dic_title = { tzgg: '通知公告', xyyw: '校园要闻', mtbd: '媒体播报', xshd: '学术活动' };

    // 设置默认值
    if (dic_title[category] === undefined) {
        category = 'tzgg';
    }

    const response = await got({
        method: 'get',
        url: 'http://www.xaut.edu.cn/index/' + dic_html[category],
    });
    const data = response.body;
    const $ = cheerio.load(data);

    // 这个列表指通知公告详情列表
    const list = $('.newslist_block ul a')
        .map((_, item) => {
            item = $(item);
            const temp = item.find('span').text();

            // link原来长这样：'../info/1196/13990.htm'
            const link = item.attr('href').replace(/^\.\./, 'http://www.xaut.edu.cn');
            let date = parseDate(temp.slice(-10, -1), 'YYYY-MM-DD');
            let title = temp.slice(0, -10);

            if (category === 'xshd') {
                date = parseDate(temp.slice(-11, -1).replace('年', '-').replace('月', '-').replace('日', ''), 'YYYY-MM-DD');
                title = temp.slice(0, -11);
            }

            return {
                title,
                link,
                pubDate: date,
            };
        })
        .get();

    ctx.state.data = {
        // 源标题
        title: '西安理工大学官网-' + dic_title[category],
        // 源链接
        link: 'http://www.xaut.edu.cn',
        // 源说明
        description: `西安理工大学官网-` + dic_title[category],
        // 遍历此前获取的数据
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    if (!item.link.match('zhixing.xaut.edu.cn') && !item.link.match('xinwen.xaut.edu.cn')) {
                        const res = await got({
                            method: 'get',
                            url: item.link,
                        });
                        const content = cheerio.load(res.body);
                        item.description = content('#vsb_content').html();
                    } else {
                        item.description = '请在校内或校园VPN内查看内容';
                    }
                    return item;
                })
            )
        ),
    };
};
