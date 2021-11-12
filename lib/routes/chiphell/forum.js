const got = require('@/utils/got');
const cheerio = require('cheerio');
const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const forumId = ctx.params.forumId;

    const feed = await parser.parseURL(`https://www.chiphell.com/forum.php?mod=rss&fid=${forumId}`);
    const items = await Promise.all(
        feed.items.map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: item.link,
            });

            const html = response.data;
            const $ = cheerio.load(html);
            const description = $('div[class="pcb"]').first();
            const imgNode = $(description).find('img');

            // replace placeholer image url
            imgNode.each((index, element) => {
                if ($(element).attr('src') && $(element).attr('src').indexOf('none.gif') !== -1) {
                    $(element).attr('src', $(element).attr('zoomfile'));
                }

                // remove image size limit
                $(element).attr('width', null);
                $(element).attr('height', null);
            });

            // remove image tips
            $(description).find('div[class*="aimg_tip"]').remove();
            $(description).find('div[class*="tip"]').remove();
            $(description).find('p[class="mbn"]').remove();

            // remove rate infomation
            $(description).find('dl[class="rate"]').remove();
            $(description).find('h3[class*="psth"]').remove();

            const single = {
                title: item.title,
                description: description.html(),
                pubDate: item.pubDate,
                link: item.link,
                author: item.author,
            };
            ctx.cache.set(item.link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    let title = feed.title.split('-');
    title = `${title[title.length - 1]} - Chiphell`;

    ctx.state.data = {
        title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
};
