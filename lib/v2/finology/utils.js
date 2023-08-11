/* eslint-disable linebreak-style */
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const getItems = async (ctx, url, extra) => {
    const mainUrl = 'https://insider.finology.in';
    const { data: response } = await got(url);
    const $ = cheerio.load(response);
    const listItems = $(extra.selector)
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('p.text-m-height').text();
            const link = item.find('a').attr('href');
            const pubDate = extra.date ? parseDate(item.find('div.text-light p').first().text(), 'DD-MMM-YYYY') : '';
            const itunes_item_image = item.find('img').attr('src');
            const category = item.find('p.pt025').text();
            return {
                title,
                link: `${mainUrl}${link}`,
                pubDate,
                itunes_item_image,
                category,
            };
        });

    const items = await Promise.all(
        listItems.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await Promise.race([
                    got(item.link),
                    new Promise((resolve) => {
                        setTimeout(
                            () => resolve({ data: `<div id="main-wrapper"><div id="insiderhead"><h1>Website did not load within Timeout Limits. <a href="${item.link}">Check with Website if the page is slow</a></h1></div></div>` }),
                            30000
                        );
                    }),
                ]);
                const $ = cheerio.load(response);
                const div = $('div.w60.flex.flex-wrap-badge');
                item.author = div.find('div a p').text();
                item.updated = div.find('p:contains("Updated on") span').text();
                const descDiv = $('div#main-wrapper div#insiderhead');
                const heading = descDiv.find('h1');
                const content = descDiv
                    .find('div.flex.flex-col.w100.align-center')
                    .clone()
                    .children('div.m-position-r')
                    .remove()
                    .end()
                    .find('a[href="https://quest.finology.in/"]')
                    .remove()
                    .end()
                    .map((index, element) => $(element).html())
                    .get()
                    .join('');
                item.description = heading + content;
                return item;
            })
        )
    );
    extra.topicName = $('h1.font-heading.fs1875')?.text();
    return items;
};

module.exports = { getItems };
