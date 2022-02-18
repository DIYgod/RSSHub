const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const slug = ctx.params.slug || 'zxww-newcppcc-zxyw-index';

    const rootUrl = 'http://www.cppcc.gov.cn';
    const currentUrl = `${rootUrl}/${slug.replace(/-/g, '/')}.shtml`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data
        .match(/new title_array\('(.*)','(.*)','\d{4}-\d{2}-\d{2}'\);/g)
        .slice(0, 15)
        .map((item) => {
            const array = item.replace(/new title_array\(|\);|'/g, '').split(',');
            return {
                link: array[0],
                title: array[1],
                pubDate: new Date(array[2]).toUTCString(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('.cnt_box .con').html();
                item.author = content('.info em').text().split('：')[1];

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${response.data.match(/<span>><\/span>(.*)<\/p>/)[1]} - 中国政协网`,
        link: currentUrl,
        item: items,
    };
};
