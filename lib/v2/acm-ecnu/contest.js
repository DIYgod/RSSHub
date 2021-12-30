const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || '';
    const publicOnly = category === 'public';
    const rootUrl = 'https://acm.ecnu.edu.cn';
    const currentUrl = `${rootUrl}/contest/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const $trList = $('div > div > table > tbody > tr');
    const items = $trList
        .filter((_, el) => !publicOnly || $(el).find('i').attr('class').includes('green'))
        .map((_, el) => {
            const $tdList = $(el).find('td');
            const title = $tdList.eq(0).text();
            const description = `Title: ${title}<br>
                Date: ${$tdList.eq(1).text()}<br>
                Duration: ${$tdList.eq(2).text()}`;
            const link = rootUrl + $tdList.find('a').eq(0).attr('href');
            return {
                title,
                description,
                link,
            };
        })
        .toArray();

    ctx.state.data = {
        title: `ECNU ACM ${publicOnly ? '公开' : ''}比赛`,
        link: currentUrl,
        item: items,
    };
};
