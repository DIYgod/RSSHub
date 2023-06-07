const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://yjszs.dhu.edu.cn';

const map = {
    doctor: '/7126/list.htm',
    master: '/7128/list.htm',
};
module.exports = async (ctx) => {
    const type = ctx.params.type || 'master';
    const link = `${baseUrl}${map[type]}`;
    const { data: response } = await got(link);

    const $ = cheerio.load(response);
    // 选择包含类名“list_item”的子元素
    const items = $('.list_item')
        // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.attr('title'),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('.Article_PublishDate').text()),
            };
        });

    ctx.state.data = {
        title: '东华大学研究生-' + $('.col_title').text(),
        link: link,
        item: items,
    };
};
