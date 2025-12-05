import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const getItems = async (url: string, extra: { date: boolean; selector: string }) => {
    const mainUrl = 'https://insider.finology.in';
    const response = await ofetch(url);
    const $ = load(response);
    const listItems = $(extra.selector)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('p.text-m-height').text();
            const link = $item.find('a').attr('href');
            const pubDate = extra.date ? timezone(parseDate($item.find('div.text-light p').first().text()), 0) : '';
            const itunes_item_image = $item.find('img').attr('src');
            const category = [$item.find('p.pt025').text()];
            return {
                title,
                link: `${mainUrl}${link}`,
                pubDate,
                itunes_item_image,
                category,
            } as DataItem;
        });

    const items = (
        await Promise.allSettled(
            listItems.map((item) => {
                if (item.link === undefined) {
                    return item;
                }
                return cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link || '');
                    const $ = load(response);
                    const div = $('div.w60.flex.flex-wrap-badge');
                    item.author = div.find('div a p').text();
                    item.updated = extra.date ? parseDate(div.find('p:contains("Updated on") span').text()) : '';
                    item.description =
                        $('div#main-wrapper div#insiderhead')
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
                            .html() ?? '';
                    return item;
                });
            })
        )
    ).map((v, index) => (v.status === 'fulfilled' ? v.value : { ...listItems[index], description: `Website did not load within Timeout Limits. <a href="${listItems[index].link}">Check with Website if the page is slow</a>` }));
    const topicName = $('h1.font-heading.fs1875')?.text();
    const validItems: DataItem[] = items.filter((item): item is DataItem => item !== null && typeof item !== 'string');
    return { items: validItems, topicName };
};

export { getItems };
