const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { getContent } = require('./utils');

const host = 'https://gs.njust.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'sytzgg_4568';
    const id = '/' + type;
    const siteUrl = host + id + '/list.htm';

    const html = await getContent(siteUrl);
    const $ = cheerio.load(html);
    const title = '南京理工大学研究生院 -- ' + $('title').text();
    const list = $('ul.news_ul').find('li');

    const items = await Promise.all(
        list.map(async (index, item) => {
            const url = $(item).find('a').attr('href');
            let desc = '';
            if (url.startsWith('/')) {
                const data = await getContent(host + url);
                desc = cheerio.load(data)('.wp_articlecontent').html();
            }

            return {
                title: $(item).find('a').attr('title').trim(),
                description: desc,
                pubDate: timezone(parseDate($(item).find('span').text(), 'YYYY-MM-DD'), +8),
                link: url,
            };
        })
    );

    ctx.state.data = {
        title,
        link: siteUrl,
        item: items,
    };
};
