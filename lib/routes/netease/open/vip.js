const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://open.163.com/';

    const list_response = await got.get(url);
    const $ = cheerio.load(list_response.data);

    const list = $('.tabcon > div:nth-child(1) ul.list li').toArray();

    const parseContent = (htmlString) => {
        const $ = cheerio.load(htmlString);

        const author = $('.CourseCommonDetail_info > div:nth-child(4)');
        const content = $('.CourseCommonDetail_contentDesc');

        return {
            author: author.text().trim(),
            description: content.html(),
            pubDate: new Date(),
        };
    };

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.ltxt')
                .text()
                .trim();
            const link = $('a.item')
                .attr('href')
                .split('?')[0];

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const rssitem = {
                title: title,
                link: link,
            };

            try {
                const response = await got.get(link);
                const result = parseContent(response.data);

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
        title: '网易公开课 - 精品课程',
        link: url,
        item: out.filter((item) => item !== ''),
    };
};
