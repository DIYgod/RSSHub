const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'http://www.maonan.gov.cn';

module.exports = async (ctx) => {
    let id = '';
    let name = '';

    switch (ctx.params.category) {
        case 'zwgk':
            id = 'zwgk';
            name = '政务公开';
            break;
        case 'zwxw':
            id = 'zwxw';
            name = '政务新闻';
            break;
        case 'mndt':
            id = 'zwxw/mndt';
            name = '茂南动态';
            break;
        case 'zdhy':
            id = 'zwxw/zdhy';
            name = '重大会议';
            break;
        case 'tzgg':
            id = 'zwgk/tzgg';
            name = '公告公示';
            break;
        case 'zlxx':
            id = 'zwgk/zlxx';
            name = '招录信息';
            break;
        case 'zcjd':
            id = 'zwgk/zcjd';
            name = '政策解读';
            break;
    }

    const res = await got(`${host}/${id}/`);
    const dataArray = res.data;
    const $ = cheerio.load(dataArray);
    const list = $('li.clearfix');

    const items = await Promise.all(
        list.map(async (i, item) => {
            item = $(item);

            const pubDate = timezone(parseDate(item.find('.time').text()), +8);

            const url = new URL(item.find('a').attr('href'));
            const link = url.href;

            let content = '';
            await ctx.cache.tryGet(link, async () => {
                const { data: res } = await got(link);
                content = cheerio.load(res);
            });

            if (url.host === 'mp.weixin.qq.com') {
                return {
                    title: item.find('a').text(),
                    description: content('#js_content').html(),
                    pubDate,
                    link,
                    author: content('#js_name').text(),
                };
            }
            return {
                title: content('.newsContainer_title').text(),
                description: content('.newsContainer_text').html(),
                pubDate,
                link,
                author: content('.author').text().trim() === '本网' ? '茂名市茂南区人民政府网' : content('.author').text().trim(),
            };
        })
    );

    ctx.state.data = {
        title: `茂名市茂南区人民政府 - ${name}`,
        link: `${host}/${id}`,
        item: items,
    };
};
