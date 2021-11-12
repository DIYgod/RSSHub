const date = require('@/utils/date');
const cheerio = require('cheerio');
const { getContent } = require('@/routes/universities/njust/eo/util');

const map = new Map([
    [1, { title: '南京理工大学研究生院 -- 通知公告', id: '/sytzgg_4568' }],
    [2, { title: '南京理工大学研究生院 -- 学术公告', id: '/xshdggl' }],
]);

const baseUrl = 'http://gs.njust.edu.cn';

module.exports = async (ctx) => {
    const type = Number.parseInt(ctx.params.type);
    const id = map.get(type).id;

    const html = await getContent(baseUrl + id + '/list.htm');
    const $ = cheerio.load(html);
    const list = $('li.list_item');

    ctx.state.data = {
        title: map.get(type).title,
        link: 'http://gs.njust.edu.cn',
        item:
            list &&
            list
                .map((index, item) => ({
                    title: $(item).find('a').text().trim(),
                    pubDate: date($(item).find('span.Article_PublishDate').text()),
                    link: $(item).find('a').attr('href'),
                }))
                .get(),
    };
};
