const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    const base = 'http://www.whb.cn';
    const url = `${base}/zhuzhan/${category}/index.html`;

    const list_response = await got.get(url);
    const $ = cheerio.load(list_response.data);

    const category_name = $('.title_jingpinhui > a').first().text();
    const list = $('.info_jingpinhui').toArray();

    const parseContent = (htmlString) => {
        const $ = cheerio.load(htmlString);

        const date_and_author = $('.content_other').text();
        // the format is "日期:YYYY年MM月DD日 HH:mm:ss\n\s+作者:xxx"
        // The timezone is GMT+8.
        const dateString = date_and_author.split('\n')[0].substr(3);
        const date = parseDate(`${dateString}+0800`, 'YYYY年MM月DD日 HH:mm:ssZZ');
        const author = date_and_author.split(':').slice(-1)[0];

        const content = $('.content_info');

        return {
            author,
            description: content.html(),
            pubDate: date,
        };
    };

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.title > a');
            const path = title.attr('href');
            const link = `${base}${path}`;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const rssitem = {
                title: title.text().trim(),
                link,
            };

            try {
                const response = await got.get(link);
                const result = parseContent(response.data);
                if (!result.description) {
                    return Promise.resolve('');
                }

                rssitem.author = result.author;
                rssitem.description = result.description;
                rssitem.pubDate = result.pubDate;
            } catch (err) {
                return Promise.resolve('');
            }
            ctx.cache.set(link, JSON.stringify(rssitem));
            return Promise.resolve(rssitem);
        })
    );

    ctx.state.data = {
        title: `文汇报 - ${category_name}`,
        link: url,
        item: out.filter((item) => item !== ''),
    };
};
