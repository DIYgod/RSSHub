const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { parseItem } = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const apiUrl = `https://www.gelonghui.com/api/subjects/${id}/contents`;
    const pageUrl = `https://www.gelonghui.com/subject/${id}`;
    const { data: response } = await got(pageUrl);
    const { data } = await got(apiUrl, {
        searchParams: {
            isChoice: false,
        },
    });

    const $ = cheerio.load(response);

    const list = data.result.map((item) => ({
        title: item.title,
        description: item.summary,
        link: item.link,
        author: item.source,
        pubDate: parseDate(item.timestamp, 'X'),
    }));

    const items = await Promise.all(list.map((item) => parseItem(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `格隆汇 - 主题 ${$('span.user-nick').text()} 的文章`,
        description: $('div.user-name').parent().children('p').text(),
        image: $('.subject-list-title').find('img').attr('data-src'),
        link: `https://www.gelonghui.com/subject/${id}`,
        item: items,
    };
};
