const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'ins';
    const category = ctx.params.category ?? (type === 'ins' ? 'all' : 's00001');
    const link = `https://news.mingpao.com/rss/${type}/${category}.xml`;

    const feed = await parser.parseURL(link);

    const renderFanBox = (pics) =>
        art(path.join(__dirname, 'templates/fancybox.art'), {
            pics,
        });

    const renderDesc = (pics, desc) =>
        art(path.join(__dirname, 'templates/description.art'), {
            pics: renderFanBox(pics),
            desc,
        });

    const items = await Promise.all(
        feed.items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        Referer: 'https://news.mingpao.com/',
                    },
                });

                const $ = cheerio.load(response.data);
                const fancyboxImg = $('a.fancybox').length ? $('a.fancybox') : $('a.fancybox-buttons');

                // remove unwanted elements
                $('div.ad300ins_m').remove();
                $('div.clear, div.inReadLrecGroup, div.clr').remove();
                $('div#ssm2').remove();
                $('iframe').remove();
                $('p[dir=ltr]').remove();

                // extract categories
                item.category = item.categories;

                // fix fancybox image
                const fancybox = fancyboxImg
                    .map((_, e) => {
                        e = $(e);
                        return {
                            href: e.attr('href'),
                            title: e.attr('title'),
                        };
                    })
                    .get();

                // remove unwanted key value
                delete item.categories;
                delete item.content;
                delete item.contentSnippet;
                delete item.creator;
                delete item.isoDate;

                item.description = renderDesc(fancybox, $('.txt4').html() ?? $('div.article_content.line_1_5em').html());
                item.pubDate = parseDate(item.pubDate);
                item.guid = item.link.indexOf('?') > 0 ? item.link : item.link.substring(0, item.link.lastIndexOf('/'));

                return item;
            })
        )
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        image: feed.image.url,
        language: feed.language,
    };

    ctx.state.json = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        image: feed.image.url,
        language: feed.language,
    };
};
