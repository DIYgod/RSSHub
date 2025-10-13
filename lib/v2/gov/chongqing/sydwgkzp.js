const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

// 重庆市事业单位公开招聘
const sydwgkzpUrl = 'https://rlsbj.cq.gov.cn/zwxx_182/sydw/';

module.exports = async (ctx) => {
    const { data: response } = await got(sydwgkzpUrl);

    const $ = cheerio.load(response);

    // 获取所有的标题
    const list = $('div.page-list .tab-item > li')
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('a').first();
            return {
                // 文章标题
                title: title.text(),
                // 文章链接
                link: `${sydwgkzpUrl}${title.attr('href')}`,
                // 文章发布日期
                pubDate: parseDate(item.find('span').text()),
            };
        });

    // 获取每个通知的具体信息
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                // 主题正文
                item.description = $('div[class="view TRS_UEDITOR trs_paper_default trs_web"]').first().html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '重庆市事业单位公开招聘',
        link: sydwgkzpUrl,
        item: items,
    };
};
