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
    const list = $('.list_item')
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

    // item content
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                item.description = $('.wp_articlecontent').first().html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '东华大学研究生-' + $('.col_title').text(),
        link,
        item: items,
    };
};
