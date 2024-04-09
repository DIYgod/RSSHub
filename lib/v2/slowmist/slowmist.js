const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const baseUrl = 'https://www.slowmist.com';
const { finishArticleItem } = require('@/utils/wechat-mp');

module.exports = async (ctx) => {
    let type = ctx.params.type;

    let title = '慢雾科技 - ';
    if (type === 'news') {
        title += '公司新闻';
    } else if (type === 'vul') {
        title += '漏洞披露';
    } else if (type === 'research') {
        title += '技术研究';
    } else {
        type = 'news';
        title += '公司新闻';
    }

    const url = `${baseUrl}/api/get_list?type=${type}`;

    const response = await got(url);

    let items = (response.data.data || []).map((item) => ({
        title: item.title,
        link: item.url,
        description: item.desc,
        pubDate: parseDate(item.date),
    }));

    items = await Promise.all(items.map((item) => finishArticleItem(ctx, item)));

    ctx.state.data = {
        title,
        link: url,
        item: items,
    };
};
