const got = require('@/utils/got');
const cheerio = require('cheerio');
const queryString = require('query-string');

module.exports = async (ctx) => {
    const { pcodeJiguan } = ctx.params;
    const link = `http://sousuo.gov.cn/list.htm`;
    const res = await got.get(link, {
        searchParams: queryString.stringify({
            n: 20,
            sort: 'pubtime',
            t: 'paper',
            pcodeJiguan: pcodeJiguan ? pcodeJiguan : '',
        }),
    });
    const $list = cheerio.load(res.data);

    ctx.state.data = {
        title: `最新文件 - 中国政府网`,
        link,
        item: await Promise.all(
            $list('body > div.dataBox > table > tbody > tr')
                .slice(1)
                .map(async (_, el) => {
                    const item = $list(el);

                    const number = item.find('td.info').next();
                    const title = item.find('td.info > a');
                    const href = title.attr('href');

                    const key = `gov_zhengce: ${href}`;
                    let description;
                    const value = await ctx.cache.get(key);

                    if (value) {
                        description = value;
                    } else {
                        const contentData = await got.get(href);
                        const $content = cheerio.load(contentData.data);
                        description = $content('#UCAP-CONTENT').html();
                        ctx.cache.set(key, description);
                    }

                    return {
                        title: number.text() + ' | ' + title.text(),
                        description,
                        link: href,
                    };
                })
                .get()
        ),
    };
};
