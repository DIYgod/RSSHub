const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.szse.cn';
    const currentUrl = `${rootUrl}/api/search/content`;

    const response = await got({
        method: 'post',
        url: currentUrl,
        form: {
            keyword: '',
            time: 0,
            range: 'title',
            'channelCode[]': 'szserulesAllRulesBuss',
            currentPage: 1,
            pageSize: 30,
            scope: 0,
        },
    });

    const list = response.data.data.map((item) => ({
        title: item.doctitle,
        link: item.docpuburl,
        pubDate: parseDate(item.docpubtime),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('#desContent').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '最新规则 - 深圳证券交易所',
        link: `${rootUrl}/lawrules/rule/new`,
        item: items,
    };
};
