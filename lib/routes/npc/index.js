const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { caty } = ctx.params;
    // 主页
    const response = await got(`http://www.npc.gov.cn/npc/${caty}/list.shtml`);
    const data = response.body;
    const $ = cheerio.load(data, { decodeEntities: false });
    const title = $('title').text();
    // 获取每条的链接
    const links = $('.clist a')
        .map((index, item) => [$(item).attr('href')])
        .get();
    // 获取标题、日期、内容
    const list = await Promise.all(
        links.map(async (link) => {
            const response = await got(`http://www.npc.gov.cn${link}`);
            const data = response.body;
            const $ = cheerio.load(data, { decodeEntities: false });
            const title = $('title').text().replace('_中国人大网', '');
            const time = $('span.fr').text();
            const description = $('#Zoom p')
                .map((index, item) => $.html(item))
                .get()
                .join('');
            return Promise.resolve([title, link, time, description]);
        })
    );
    // 整合
    ctx.state.data = {
        title: title,
        link: `http://www.npc.gov.cn/npc/${caty}/list.shtml`,
        description: title,
        item: list.map((item) => ({
            title: item[0],
            link: `http://www.npc.gov.cn${item[1]}`,
            pubDate: new Date(Date.parse(item[2].replace(/[年月日]/g, '/'))).toUTCString(),
            description: item[3],
        })),
    };
};
