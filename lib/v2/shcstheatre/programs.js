const got = require('@/utils/got');
const { art } = require('@/utils/render');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = `https://www.shcstheatre.com/Program/programList.aspx`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const items = await Promise.all(
        $('#datarow > div').map(async (_, elem) => {
            const title = $('.program-name', elem).text().trim();
            const link = new URL($('.program-name a', elem).attr('href'), url);
            const id = link.searchParams.get('id');
            const res2 = await got.post(`https://www.shcstheatre.com/webapi.ashx?op=GettblprogramCache`, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                form: { id },
            });
            const data = res2.data.data.tblprogram[0];
            return {
                title,
                link: link.toString(),
                description: art(__dirname + '/description.art', data),
            };
        })
    );
    const image = $('.menu-logo img').attr('src');

    ctx.state.data = {
        title: `上海文化广场 - 节目列表`,
        link: url,
        image,
        item: items,
    };
};
