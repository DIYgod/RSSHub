const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://hellogithub.com';
    const currentUrl = 'https://hellogithub.com/article';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });
    const $ = cheerio.load(response.data);
    let count = $('.pricing-table-price').eq(0).text();
    count = count.replace(/[^0-9]/gi, '');
    let start = count - 10;
    const PromiseArr = [];
    for (start; start <= count; start++) {
        PromiseArr.push(
            new Promise((resolve) => {
                const link = `https://hellogithub.com/periodical/volume/${start}/`;
                const issueNum = start;
                return ctx.cache.tryGet(link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: link,
                    });
                    const $ = cheerio.load(detailResponse.data);
                    return resolve({
                        title: '第' + issueNum + '期',
                        link,
                        description: $('.content').html(),
                    });
                });
            })
        );
    }
    const items = await Promise.all(PromiseArr);
    ctx.state.data = {
        title: 'HelloGitHub - Article',
        link: currentUrl,
        item: items,
    };
};
