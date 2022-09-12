const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const categories = {
    112: '总局要闻',
    113: '公告公示',
    114: '工作动态',
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 112;

    const rootUrl = 'http://www.nrta.gov.cn';

    const currentUrl = `${rootUrl}/col/col${category}/index.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const regex = /<!\[CDATA\[([\s\S]*?)\]\]>(?=\s*<)/gi;
    const data = response.data.replace(regex, '$1');

    const $ = cheerio.load(data, {
        xmlMode: true,
    });

    const list = $('a', 'record')
        .map((_, item) => {
            item = $(item);
            return {
                link: item.attr('href'),
            };
        })
        .get();
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);
                item.title = content('td[id="artTitMob"]').text();
                item.description = content('div[id="c"]').html();
                item.pubDate = timezone(parseDate(content('.mobile_time.shareWarpTime').text().trim()), +8);
                item.author = content('.mobile_time.shareFromz').text();
                return item;
            })
        )
    );
    ctx.state.data = {
        title: category in categories ? categories[category] : '其他',
        link: `http://www.nrta.gov.cn/col/col${category}/index.html`,
        description: '国家广播电视总局',
        language: 'zh-cn',
        item: items,
    };
};
