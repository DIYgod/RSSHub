const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'http://www.grs.zju.edu.cn';

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type);
    const url = `${host}/yjszs/${type}/list.htm`;
    const res = await got(url);
    const $ = cheerio.load(res.data);
    const list = $('#wp_news_w17 .common-news-list li');
    const items = await Promise.all(
        list.map((i, item) => {
            item = $(item);
            const title = item.find('a').attr('title');
            const pubDate = timezone(parseDate(item.find('.date').text().trim(), 'YY-MM-DD'), +8);
            const path = item.find('a').eq(-1).attr('href');
            let link = '';
            if (path.startsWith('http')) {
                link = path;
            } else {
                link = host + path;
            }
            return ctx.cache.tryGet(link, async () => {
                let description = title;
                try {
                    const result = await got(link);
                    const $ = cheerio.load(result.data);
                    description = $('.article .wp_articlecontent').html().trim();
                } catch (err) {
                    description = title;
                }
                return {
                    title,
                    link,
                    pubDate,
                    description,
                };
            });
        })
    );
    ctx.state.data = {
        title: '浙江大学研究生招生信息网',
        link: url,
        item: items,
    };
};
