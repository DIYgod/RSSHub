const date = require('@/utils/date');
const cheerio = require('cheerio');
const { getContent } = require('@/routes/universities/njust/eo/util');

const map = new Map([
    ['16tz', { title: '南京理工大学电光16 -- 通知公告', id: '/_t217/tzgg/list.htm' }],
    ['16dt', { title: '南京理工大学电光16 -- 主任寄语', id: '/_t217/zrjy/list.htm' }],
    ['17tz', { title: '南京理工大学电光17 -- 年级通知', id: '/_t689/njtz/list.htm' }],
    ['17dt', { title: '南京理工大学电光17 -- 每日动态', id: '/_t689/mrdt/list.htm' }],
    ['18tz', { title: '南京理工大学电光18 -- 年级通知', id: '/_t900/njtz_10234/list.htm' }],
    ['18dt', { title: '南京理工大学电光18 -- 主任寄语', id: '/_t900/zrjy_10251/list.htm' }],
    ['19tz', { title: '南京理工大学电光19 -- 通知公告', id: '/_t1163/tzgg_11606/list.htm' }],
    ['19dt', { title: '南京理工大学电光19 -- 每日动态', id: '/_t1163/mrdt_11608/list.htm' }],
]);

const baseUrl = 'http://dgxg.njust.edu.cn';

module.exports = async (ctx) => {
    const grade = ctx.params.grade || '17';
    const type = ctx.params.type || 'tz';
    const category = grade + type;
    const id = map.get(category).id;

    const html = await getContent(baseUrl + id);
    const $ = cheerio.load(html);
    const list = $('li.list_item');

    ctx.state.data = {
        title: map.get(category).title,
        link: baseUrl + '/' + id.split('/')[1] + '/main.htm',
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
