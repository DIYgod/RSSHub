const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const { rootUrl } = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = `${rootUrl}/brief`;
    const apiUrl = `${rootUrl}/api/ajax/getbrieflist?type=0&page=1&pagesize=${ctx.query.limit ?? 50}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.map((item) => ({
        title: item.indexTitle,
        link: `${rootUrl}${item.url}`,
        description: item.newcontent,
        pubDate: timezone(parseDate(`${item.datekey} ${item.hm}`, 'YYYY.MM.DD HH:mm'), +8),
    }));

    ctx.state.data = {
        title: '第一财经 - 正在',
        link: currentUrl,
        item: items,
    };
};
