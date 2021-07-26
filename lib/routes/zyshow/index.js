const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.name = ctx.params.name || 'chongchongchong';

    const rootUrl = `http://www.zyshow.net`;
    const currentUrl = `${rootUrl}/${ctx.params.name}/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('#event_detail table tr')
        .slice(1, 30)
        .map((_, tr) => {
            tr = $(tr);
            const link = tr.find('td a');
            const tds = tr.find('td');
            const name = $(tds[0]).html();
            const zt = $(tds[1]).text();
            const lb = $(tds[2]).text();
            const des = `<table><tr><td>播出日期:</td><td><b>${name}</b></td></tr>
            <tr><td>综艺节目主题:</td><td><b>${zt}</b></td></tr>
            <tr><td>综艺节目来宾:</td><td><b>${lb}</b></td></tr>
            </table>`;
            return {
                title: link.text(),
                link: `${rootUrl}/${link.attr('href')}`,
                description: des,
                author: link.text(),
            };
        })
        .get();

    ctx.state.data = {
        title: `${$('title').text()}`,
        link: currentUrl,
        item: list,
    };
};
