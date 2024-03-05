// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const getItems = async (ctx, url, extra) => {
    const mainUrl = 'https://insider.finology.in';
    const { data: response } = await got(url);
    const $ = load(response);
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

    const items = (
        await Promise.allSettled(
            listItems.map((item) =>
                cache.tryGet(item.link, async () => {
                    const { data: response } = await got(item.link);
                    const $ = load(response);
                    const div = $('div.w60.flex.flex-wrap-badge');
                    item.author = div.find('div a p').text();
                    item.updated = div.find('p:contains("Updated on") span').text();
                    item.description = $('div#main-wrapper div#insiderhead')
                        .find('div.flex.flex-col.w100.align-center')
                        .children('div.m-position-r')
                        .remove()
                        .end()
                        .find('a[href="https://quest.finology.in/"]')
                        .remove()
                        .end()
                        .find('div.blur-wall-wrap')
                        .remove()
                        .end()
                        .html();
                    return item;
                })
            )
        )
    ).map((v, index) => (v.status === 'fulfilled' ? v.value : { ...listItems[index], description: `Website did not load within Timeout Limits. <a href="${listItems[index].link}">Check with Website if the page is slow</a>` }));
    extra.topicName = $('h1.font-heading.fs1875')?.text();

    return items;
};

module.exports = { getItems };
