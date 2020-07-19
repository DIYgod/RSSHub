const got = require('@/utils/got');
const host = 'https://www.curseforge.com';
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const gameid = ctx.params.gameid;
    const catagoryid = ctx.params.catagoryid;
    const projectid = ctx.params.projectid;
    const filePage = host + `/${gameid}/${catagoryid}/${projectid}/files`;
    const response = await got({
        method: 'get',
        url: filePage,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('tr.project-file-list__item');
    ctx.state.data = {
        title: `CurseForge - ${$('h2.name').text()}`,
        link: filePage,
        description: 'CurseForge文件更新提醒',
        item: list
            .map((i, item) => ({
                title: $(item).find('span.table__content.file__name.full').text().trim(),
                description: `<table>
                <tr>
                  <td>FileType</td>
                  <td>FileName</td>
                  <td>FileSize</td>
                  <td>Download</td></tr>
                <tr>
                  <td>${$(item).find('td.project-file__release-type > span').attr('title')}</td>
                  <td>${$(item).find('span.table__content.file__name.full').text().trim()}</td>
                  <td>${$(item).find('span.table__content.file__size').text().trim()}</td>
                  <td><a href="${host + $(item).find('td.project-file__actions a').attr('href')}">Click Me</a></td>
                </tr>
              </table>`,
                link: filePage,
                pubDate: new Date(1000 * $(item).find('td.project-file__date-uploaded abbr').attr('data-epoch')).toUTCString(),
            }))
            .get(),
    };
};
