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
        headers: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
        },
    });
    const data = response.body;
    const $ = cheerio.load(data);

    const list = $('.newslist_block a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const temp = item.find('span').text();
            const link = item.attr('href').replace(/^\.\./, 'http://www.xaut.edu.cn');
            let date = parseDate(temp.slice(-10, -1),'YYYY-MM-DD');
            let title = temp.slice(0, -10);
            if (category === 'xshd') {
                date = new Date(parseDate(temp.slice(-11, -1).replace('年', '-').replace('月', '-').replace('日', ''),'YYYY-MM-DD'));
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
