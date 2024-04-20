import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.indiansinkuwait.com';

export const route: Route = {
    path: '/latest',
    categories: ['new-media'],
    example: '/indiansinkuwait/latest',
    parameters: {},
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
            source: ['indiansinkuwait.com/latest-news', 'indiansinkuwait.com/'],
        },
    ],
    name: 'News',
    maintainers: ['TonyRL'],
    handler,
    url: 'indiansinkuwait.com/latest-news',
};

async function handler() {
    const { data: response } = await got(`${baseUrl}/latest-news`);
    const $ = load(response);

    const list = $('.paragraphs .span4')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.content-heading h6 a').text().trim(),
                link: baseUrl + item.find('a').attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                item.pubDate = parseDate($('#ctl00_ContentPlaceHolder1_SpanAuthor').text());
                $('#newsdetails h3, #ctl00_ContentPlaceHolder1_SpanAuthor, .noprint, [id^=div-gpt-ad]').remove();
                item.description = $('#newsdetails').html();

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        image: 'https://www.indiansinkuwait.com/apple-touch-icon-152x152-precomposed.png',
        link: `${baseUrl}/latest-news`,
        item: items,
    };
}
