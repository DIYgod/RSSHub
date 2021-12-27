const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const link = 'https://computer.hdu.edu.cn';
const host = 'https://computer.hdu.edu.cn/6738/list.htm';

const getSingleRecord = async () => {
    const res = await got({
        method: 'get',
        url: host,
    });

    const $ = cheerio.load(res.data);
    const list = $('.posts-list').find('li');

    return (
        list &&
        list
            .map((index, item) => {
                item = $(item);
                const dateTxt = item.find('.date').text();
                const date = dateTxt.slice(1, dateTxt.length - 1);
                return {
                    title: item.find('a').text(),
                    pubDate: parseDate(date),
                    link: link + item.find('a').attr('href'),
                };
            })
            .get()
    );
};

module.exports = async (ctx) => {
    const items = await getSingleRecord();
    const out = await Promise.all(
        items.map(async (item) => {
            await ctx.cache.get(item.link, async () => {
                const result = await got.get(link);
                const $ = cheerio.load(result.data);
                return $('.wp_articlecontent').html();
            });
            const response = await got({
                method: 'get',
                url: item.link,
                headers: {
                    Referer: link,
                },
            });
            const $ = cheerio.load(response.data);
            const content = $('.wp_articlecontent').html();
            const record = {
                title: item.title,
                link: item.link,
                description: content,
                pubDate: item.pubDate,
            };
            return Promise.resolve(record);
        })
    );

    ctx.state.data = {
        title: '杭州电子科技大学计算机学院-通知公告',
        description: '杭州电子科技大学计算机学院-通知公告',
        link: host,
        item: out,
    };
};
