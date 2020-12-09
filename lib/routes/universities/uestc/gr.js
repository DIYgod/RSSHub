const got = require('@/utils/got');
const cheerio = require('cheerio');

const dateRegex = /(20\d{2})\/(\d{2})\/(\d{2})/;
const baseUrl = 'https://gr.uestc.edu.cn/';
// const detailUrl = 'http://www.jwc.uestc.edu.cn/web/News!view.action?id=';

module.exports = async (ctx) => {
    const type = ctx.params.type || '119';
    const suscribe_types = type.split('+')
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
