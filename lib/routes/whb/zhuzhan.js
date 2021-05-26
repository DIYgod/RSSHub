const got = require('@/utils/got');
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

        const matched_date = /(\d+)年(\d+)月(\d+)日 (\d+):(\d+):(\d+)/.exec(date_and_author);
        const date = new Date(parseInt(matched_date[1]), parseInt(matched_date[2]) - 1, parseInt(matched_date[3]), parseInt(matched_date[4]), parseInt(matched_date[5]), parseInt(matched_date[6]));

        const author = date_and_author.split(':').slice(-1)[0];

        const content = $('.content_info');

        return {
            author: author,
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
                link: link,
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
