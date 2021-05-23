const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const locale = ctx.params.locale;

    const category_url = await ctx.cache.tryGet([locale, category], async () => {
        const front_page = await got({
            method: 'get',
            url: `https://news.google.com/?${locale}`,
        });

        const front_data = front_page.data;

        const $ = cheerio.load(front_data);
        const category_list = $('a.wmzpFf.yETrXb');

        const category_text = [];
        category_list.each((index, item) => {
            category_text.push($(item).text());
        });

        return url.resolve('https://news.google.com', category_list.eq(category_text.indexOf(category)).attr('href'));
    });

    const response = await got({
        method: 'get',
        url: category_url,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div.xrnccd');

    let itemPicUrl;
    let meta;
    let description;
    let link;

    ctx.state.data = {
        title: $('title').text(),
        link: category_url,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item.find('img').attr('src');

                    meta = item.find('div.SVJrMe').first();

                    description = item
                        .find('h4.ipQwMb')
                        .removeAttr('class')
                        .each((index, item) => {
                            $(item)
                                .children()
                                .removeAttr('class')
                                .attr('href', url.resolve('https://news.google.com', $(item).children().attr('href')));
                        })
                        .toString();

                    link = url.resolve('https://news.google.com', item.find('a.VDXfz').first().attr('href'));

                    if (itemPicUrl !== undefined) {
                        description = `${description}<img src="${itemPicUrl}">`;
                    }
                    if (description === null) {
                        description = link;
                    }

                    return {
                        title: item.find('h3').children().text(),
                        description: description,
                        pubDate: meta.find('time').first().attr('datetime'),
                        author: meta.find('a.wEwyrc').first().text(),
                        link: link,
                    };
                })
                .get(),
    };
};
