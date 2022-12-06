const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';
    const publicOnly = category === 'public';
    const rootUrl = 'https://acm.ecnu.edu.cn';
    const currentUrl = `${rootUrl}/contest/`;

    const response = await got(currentUrl);

    const $ = cheerio.load(response.data);
    const $trList = $('div > div > table > tbody > tr');
    const items = $trList
        .filter((_, el) => !publicOnly || $(el).find('i').attr('class').includes('green'))
        .map((_, el) => {
            const $tdList = $(el).find('td');
            const title = $tdList.eq(0).text();
            const startTime = $tdList.eq(1).text();
            const duration = $tdList.eq(2).text();
            const link = rootUrl + $tdList.find('a').eq(0).attr('href');
            return {
                title,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    title,
                    startTime,
                    duration,
                }),
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
