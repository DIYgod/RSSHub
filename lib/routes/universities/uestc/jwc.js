const got = require('@/utils/got');
const cheerio = require('cheerio');

const dateRegex = /(20\d{2})\/(\d{2})\/(\d{2})/;
const baseUrl = 'http://www.jwc.uestc.edu.cn/';
const detailUrl = 'http://www.jwc.uestc.edu.cn/web/News!view.action?id=';
const map = {
    important: 'web/News!queryHard.action',
    student: 'web/News!queryList.action?partId=256',
    teacher: 'web/News!queryList.action?partId=255',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'important';
    const response = await got({
        method: 'get',
        url: baseUrl + map[type],
        headers: {
            Referer: baseUrl,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    ctx.state.data = {
        title: '电子科技大学教务处通知公告',
        link: baseUrl,
        item: $('div[class="textAreo clearfix"] a')
            .slice(0, 10)
            .map((_, elem) => ({
                link: detailUrl + elem.attribs.newsid,
                title: elem.attribs.title,
                pubDate: new Date($(elem).next('i').text().replace(dateRegex, '$1-$2-$3')).toUTCString(),
            }))
            .get(),
    };
};
