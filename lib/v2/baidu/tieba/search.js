const got = require('@/utils/got');
const querystring = require('querystring');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const qw = ctx.params.qw;
    const query = querystring.parse(ctx.params.routeParams);
    query.qw = qw;
    query.rn = query.rn || 20; // Number of returned items
    const link = `https://tieba.baidu.com/f/search/res?${querystring.stringify(query)}`;

    const response = await got.get(link, {
        headers: {
            Referer: 'https://tieba.baidu.com',
        },
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gbk');

    const $ = cheerio.load(data);
    const resultList = $('div.s_post');

    ctx.state.data = {
        title: `${qw} - ${query.kw || '百度贴'}吧搜索`,
        link,
        item: resultList.toArray().map((element) => {
            const item = $(element);
            const titleItem = item.find('.p_title a');
            const title = titleItem.text().trim();
            const link = titleItem.attr('href');
            const time = item.find('.p_date').text().trim();
            const details = item.find('.p_content').text().trim();
            const medias = item
                .find('.p_mediaCont img')
                .toArray()
                .map((element) => {
                    const item = $(element);
                    return `<img src="${item.attr('original')}">`;
                })
                .join('');
            const tieba = item.find('a.p_forum').text().trim();
            const author_name = item.find('a').last().text().trim();

            return {
                title,
                description: art(path.join(__dirname, '../templates/tieba_search.art'), {
                    details,
                    medias,
                    tieba,
                    author_name,
                }),
                author: author_name,
                pubDate: timezone(parseDate(time, 'YYYY-MM-DD HH:mm'), +8),
                link,
            };
        }),
    };
};
