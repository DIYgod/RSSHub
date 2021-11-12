const got = require('@/utils/got');
const cheerio = require('cheerio');

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
    const $list = cheerio.load(res.data);

    ctx.state.data = {
        title: `信息稿件 - 中国政府网`,
        link: `${link}?${query}`,
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
                        try {
                            const contentData = await got.get(href);
                            const $content = cheerio.load(contentData.data);
                            description = $content('#UCAP-CONTENT').html();
                        } catch (error) {
                            description = '文章已被删除';
                        }

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
