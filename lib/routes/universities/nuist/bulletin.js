const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseTitle = '南信大信息公告栏';
const baseUrl = 'https://bulletin.nuist.edu.cn';
const map = {
    '791': '全部',
    '792': '文件公告',
    xsbgw: '学术报告',
    '779': '招标信息',
    '780': '会议通知',
    '781': '党政事务',
    '782': '组织人事',
    '783': '科研信息',
    '784': '招生就业',
    '785': '教学考试',
    '786': '专题讲座',
    '788': '校园活动',
    '789': '学院动态',
    qt: '其他',
};

module.exports = async (ctx) => {
    const category = map.hasOwnProperty(ctx.params.category) ? ctx.params.category : '791';
    const link = `${baseUrl}/${category}/list.htm`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.news_list')
        .find('.news')
        .slice(0, 10);

    ctx.state.data = {
        title: baseTitle + (category === '791' ? '' : ':' + map[category]),
        link: link,
        item: list
            .map((_, item) => {
                item = $(item);

                if (category === 'xsbgw') {
                    const itemXsTitle = item.find('.xs_title .btt a');
                    return {
                        title: itemXsTitle.text(),
                        author: item.find('.xs_bgr').text(),
                        category: '学术报告',
                        pubDate: new Date(item.find('.xs_date').text()).toUTCString(),
                        link: url.resolve(baseUrl, itemXsTitle.attr('href')),
                    };
                }

                const itemTitle = item.find('.news_title');
                return {
                    title: [itemTitle.find('.zdtb img').length > 0 ? '[顶]' : '', itemTitle.find('.btt').text()].join(''),
                    author: item.find('.news_org').text(),
                    category: itemTitle.find('.wjj').text(),
                    pubDate: new Date(item.find('.news_date').text()).toUTCString(),
                    link: url.resolve(baseUrl, itemTitle.find('.btt a').attr('href')),
                };
            })
            .get(),
    };
};
