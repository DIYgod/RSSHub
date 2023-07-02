const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const baseUrl = 'http://graduate.cug.edu.cn';
    const reqUrl = `${baseUrl}/zhtzgg.htm`;
    const res = await got(reqUrl);
    const selector = 'div.main_conRCb > ul > li';
    let items = cheerio
        .load(res.data)(selector)
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const href = $item('a').attr('href');
            const link = href.includes('http') ? href : baseUrl + '/' + href;
            return {
                // title from <li id="line_u7_0"><a href="info/1214/12310.htm"><span>2023-06-30</span><em>关于做好2023年研究生暑期教育管理工作的通知</em></a></li>
                title: $item('a em').text(),
                link: link,
                description: '',
                enabled: true,
                pubDate: new Date($item('a span').text()).toUTCString(),
            };
        })
        .get();

    let out = await Promise.all(
        items.map(async (element) => {
            return ctx.cache.tryGet(`cug/${element.link}`, async () => {
                try {
                    if (!element.link.includes('graduate.cug.edu.cn')) {
                        return element;
                    }
                    const result = await got.get(element.link);
                    const $ = cheerio.load(result.data);
                    element.description = $('.v_news_content').html();
                    element.enabled = true;
                } catch (e) {
                    // rsshub log
                    console.log(e);
                }
                return element;
            });
        })
    );

    ctx.state.data = {
        title: '中国地址大学(武汉)研究生院 - 综合通知公告',
        description: '中国地址大学(武汉)研究生院 - 综合通知公告',
        link: `${baseUrl}/zhtzgg.htm`,
        item: out,
    };
};
