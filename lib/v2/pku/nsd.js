const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://nsd.pku.edu.cn/sylm/gd/';

module.exports = async (ctx) => {
    const response = await got({ url: baseUrl, https: { rejectUnauthorized: false } });

    const $ = cheerio.load(response.data);
    const list = $('div.maincontent > ul > li')
        .map((_index, item) => {
            const href = $(item).find('a').attr('href');
            const inner = !href.startsWith('http');
            return {
                title: $(item).find('a').text().trim(),
                link: inner ? baseUrl + href : href,
                pubDate: parseDate($(item).find('span').first().text(), 'YYYY-MM-DD'),
                inner,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            item.inner
                ? ctx.cache.tryGet(item.link, async () => {
                      const detailResponse = await got({ url: item.link, https: { rejectUnauthorized: false } });
                      const content = cheerio.load(detailResponse.data);
                      item.description = content('div.article').html();
                      return item;
                  })
                : item
        )
    );

    ctx.state.data = {
        title: '观点 - 北京大学国家发展研究院',
        link: baseUrl,
        item: items,
    };
};
