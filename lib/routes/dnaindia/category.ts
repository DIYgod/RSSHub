import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import logger from '@/utils/logger';

export const route: Route = {
    path: ['/:category', '/topic/:topic'],
    categories: ['traditional-media'],
    example: '/dnaindia/headlines',
    parameters: { category: 'Find it in the URL, or tables below' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['dnaindia.com/:category'],
        },
    ],
    name: 'News',
    maintainers: ['Rjnishant530'],
    handler,
    description: `Topics:

  | DNA verified |
  | ------------ |
  | dna-verified |

  :::tip Topic
  The URL of the form \`https://www.dnaindia.com/topic/dna-verified\` demonstrates the utilization of the subdomain \`topic\`
  :::`,
    description: `Categories:

  | Headlines | Explainer | India | Entertainment | Sports | Viral | Lifestyle | Education | Business | World |
  | --------- | --------- | ----- | ------------- | ------ | ----- | --------- | --------- | -------- | ----- |
  | headlines | explainer | india | entertainment | sports | viral | lifestyle | education | business | world |`,
};

async function handler(ctx) {
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
    const { data: response } = await got(`${baseUrl}${route}`);
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
        link: baseUrl,
        item: items,
        description: 'Latest News on dnaIndia.com',
        logo: 'https://cdn.dnaindia.com/sites/all/themes/dnaindia/favicon-1016.ico',
        icon: 'https://cdn.dnaindia.com/sites/all/themes/dnaindia/favicon-1016.ico',
        language: 'en-us',
    };
}
