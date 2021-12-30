const got = require('@/utils/got');
const cheerio = require('cheerio');
const moment = require('moment');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.hackerrank.com';
    const currentUrl = `${rootUrl}/contests/`;

    const response = await got({
        method: 'get',
        headers: {
            'User-Agent': 'curl/7.65.0',
        },
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const activeContests = $('div[class*="active-contest-container"]');
    const items = activeContests
        .find('li')
        .map((_, el) => {
            let title = $(el).find('h4').eq(0).text();

            let timeInfo = '';

            if ($(el).find('meta[itemprop="startDate"]').length > 0) {
                timeInfo += ' ';
                const startTime = moment($(el).find('meta[itemprop="startDate"]').attr('content'));
                const duration = $(el).find('meta[itemprop="duration"]').attr('content');
                const hours = moment.duration(duration).asHours();
                const beijingTime = startTime.utcOffset('+0800').format('YYYY-MM-DD HH:mm:ss');
                timeInfo += `( 北京时间： ${beijingTime}, 时长： ${hours} 小时 )`;
            }
            title += timeInfo;
            const description = title;
            const link = rootUrl + $(el).find('a').eq(0).attr('href');
            return {
                title,
                description,
                link,
            };
        })
        .toArray();

    ctx.state.data = {
        title: 'Hackerrank 活跃的比赛',
        link: currentUrl,
        item: items,
    };
};
