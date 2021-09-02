const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'ins';
    const category = ctx.params.category || (type === 'ins' ? 'all' : 's00001');
    const link = `https://news.mingpao.com/rss/${type}/${category}.xml`;

    const feed = await parser.parseURL(link);

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got({
                method: 'get',
                url: item.link,
                headers: {
                    Referer: 'https://news.mingpao.com/',
                },
            });

            const $ = cheerio.load(response.data);
            const fancyboxImg = $('a.fancybox').html() ? $('a.fancybox') : $('a.fancybox-buttons');
            let fancybox = '';

            // remove unwanted elements
            $('div.ad300ins_m').remove();
            $('div.clear').remove();
            $('div.inReadLrecGroup').remove();
            $('div.clr').remove();
            $('div#ssm2').remove();

            // extract categories
            item.category = item.categories;

            // fix fancybox image
            fancyboxImg.each((_, e) => {
                fancybox += `<figure><img src="${$(e).attr('href')}" alt="${$(e).attr('title')}"><figcaption>${$(e).attr('title')}</figcaption></figure>`;
            });

            // remove unwanted key value
            delete item.categories;
            delete item.content;
            delete item.contentSnippet;
            delete item.creator;

            item.description = cheerio.load(fancybox).html() + ($('.txt4').html() || $('div.article_content.line_1_5em').html());
            item.pubDate = parseDate(item.pubDate);

            ctx.cache.set(item.link, JSON.stringify(item));
            return item;
        })
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        image: feed.image.url,
        language: feed.language,
    };
};
