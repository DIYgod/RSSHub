const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const { advance } = ctx.params;
    const link = `http://sousuo.gov.cn/list.htm`;
    const params = new URLSearchParams({
        n: 20,
        t: 'govall',
        sort: 'pubtime',
        advance: 'true',
    });
    const query = `${params.toString()}&${advance}`;
    const res = await got.get(link, {
        searchParams: query.replace(/([\u4e00-\u9fa5])/g, (str) => encodeURIComponent(str)),
    });
    const $ = cheerio.load(res.data);

    const list = $('body > div.dataBox > table > tbody > tr')
        .slice(1)
        .toArray()
        .map((elem) => {
            elem = $(elem);
            return {
                title: elem.find('td:nth-child(2) > a').text(),
                link: elem.find('td:nth-child(2) > a').attr('href'),
                pubDate: timezone(parseDate(elem.find('td:nth-child(5)').text()), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                let description = '';
                try {
                    const contentData = await got(item.link);
                    const $ = cheerio.load(contentData.data);
                    description = $('#UCAP-CONTENT').html();
                } catch (error) {
                    description = '文章已被删除';
                }
                item.description = description;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '信息稿件 - 中国政府网',
        link: `${link}?${query}`,
        item: items,
    };
};
