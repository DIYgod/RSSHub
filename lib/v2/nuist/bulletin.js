const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseTitle = '南信大信息公告栏';
const baseUrl = 'https://bulletin.nuist.edu.cn';
const map = {
    791: '全部',
    792: '文件公告',
    xsbgw: '学术报告',
    779: '招标信息',
    780: '会议通知',
    781: '党政事务',
    782: '组织人事',
    783: '科研信息',
    784: '招生就业',
    785: '教学考试',
    786: '专题讲座',
    788: '校园活动',
    789: '学院动态',
    qt: '其他',
};

module.exports = async (ctx) => {
    const category = map.hasOwnProperty(ctx.params.category) ? ctx.params.category : '791';
    const link = `${baseUrl}/${category}/list.htm`;

    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('.news_list .news')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.btt').text().trim(),
                link: new URL(item.find('.btt a').attr('href'), baseUrl).href,
                pubDate: item
                    .find('.arti_bs')
                    .text()
                    .match(/\d.*?-\d\d-\d\d/)[0],
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                let response;
                try {
                    response = await got(item.link);
                    const $ = cheerio.load(response.data);

                    item.author = $('.arti_publisher') ? $('.arti_publisher').text() : null;
                    item.pubDate = parseDate(
                        $('.arti_update')
                            .text()
                            .match(/\d.*?-\d\d-\d\d/)[0]
                    );

                    item.description = $('.read')
                        .html()
                        .replace(/class=".*?"/g, '')
                        .replace(/src="\/_/gm, 'src="https://bulletin.nuist.edu.cn/_')
                        .replace(/href="\/_/gm, 'href="https://bulletin.nuist.edu.cn/_');
                } catch (e) {
                    // intranet
                }
                return item;
            })
        )
    );
    ctx.state.data = {
        title: baseTitle + (category === '791' ? '' : ':' + map[category]),
        link,
        description: ' 南信大信息公告栏',
        item: items,
    };
};
