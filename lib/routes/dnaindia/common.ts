import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import logger from '@/utils/logger';

export async function handler(ctx) {
    const { category, topic } = ctx.req.param();
    const baseUrl = 'https://www.dnaindia.com';
    let route;
    if (category) {
        route = `/${category}`;
    } else if (topic) {
        route = `/topic/${topic}`;
    } else {
        logger.error('Invalid URL');
    }
    const link = `${baseUrl}${route}`;
    const { data: response } = await got(link);
    const $ = load(response);

    const listItems = $('div.col-lg-6 div.list-news')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('div.explainer-subtext a');
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
            };
        });

    const items = await Promise.all(
        listItems.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.itunes_item_image = $('div.article-img img').attr('src');
                item.category = $('div.tags ul li')
                    .toArray()
                    .map((item) => $(item).find('a').text());
                const time = $('p.dna-update').text().split('Updated:')[1];
                item.pubDate = timezone(parseDate(time, 'MMMDD,YYYY,hh:mmA'), +5.5);
                item.author = 'DNA Web Team';
                item.description = $('div.article-description')
                    .clone()
                    .children('div')
                    .remove()
                    .end()
                    .toArray()
                    .map((element) => $(element).html())
                    .join('');
                return item;
            })
        )
    );

    return {
        title: 'DNA India',
        link,
        item: items,
        description: 'Latest News on dnaIndia.com',
        logo: 'https://cdn.dnaindia.com/sites/all/themes/dnaindia/favicon-1016.ico',
        icon: 'https://cdn.dnaindia.com/sites/all/themes/dnaindia/favicon-1016.ico',
        language: 'en-us',
    };
}
