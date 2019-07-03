const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const host = 'https://home.kpmg';

module.exports = async (ctx) => {
    const link = 'https://home.kpmg/cn/zh/home/insights.html';

    const api = 'https://home.kpmg/search/?all_sites=false&site=cn_zh&language=zh&x1=KPMG_Tab_Type&q1=Insights&sort=KPMG_Filter_Date&facets=false';
    const response = await got({
        method: 'get',
        url: api,
        headers: {
            Referer: link,
        },
    });
    const list = response.data['customer-results'].resultset.results.result;

    const out = await Promise.all(
        list.map(async (item) => {
            const title = item.KPMG_Title;
            const itemUrl = url.resolve(host, item.KPMG_URL);

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(itemUrl);
            const $ = cheerio.load(response.data);
            let description = $('div.bodytext-data').html();

            if ($('a.component-link')) {
                const link = $('a.component-link').attr('href');
                description += `<p><a href='${link}'>点击下载PDF</a></p>`;
            }

            const single = {
                title: title,
                link: itemUrl,
                description: description,
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '毕马威洞察',
        link: link,
        description: '欢迎浏览毕马威中国网站的知识库。在这里，你可以找到毕马威中国各类定期出版的通讯及各通讯过往的期号。',
        item: out,
    };
};
