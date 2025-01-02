import { Data, DataItem, Route } from '@/types';
import { baseUrl } from './utils';
import dayjs from 'dayjs';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import logger from '@/utils/logger';

export const route: Route = {
    path: '/newsToday',
    example: '/visionias/newsToday',
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
            source: ['visionias.in/current-affairs/news-today'],
            target: '/newsToday',
        },
    ],
    name: 'News Today',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(): Promise<Data> {
    const currentYear = dayjs().year();
    const currentMonth = dayjs().month() + 1;
    logger.info(`Getting news for month ${currentMonth} and year ${currentYear}`);
    const response = await ofetch(`${baseUrl}/current-affairs/news-today/getbymonth?year=${currentYear}&month=${currentMonth}`);

    let items: any = [];
    // let title = 'News Today';
    let currentUrl = '';
    if (response.length !== 0) {
        currentUrl = response[0].url;
        // title = response[0].formatted_published_at;
        items = await processCurrentNews(currentUrl);
    }

    return {
        title: `News Today | Current Affairs | Vision IAS`,
        link: `${baseUrl}${currentUrl === '' ? '/current-affairs/news-today/' : currentUrl}`,
        description: 'News Today is a daily bulletin providing readers with a comprehensive overview of news developments, news types, and technical terms.',
        language: 'en',
        item: items,
        image: `${baseUrl}/current-affairs/images/news-today-logo.svg`,
        icon: `${baseUrl}/current-affairs/favicon.ico`,
        logo: `${baseUrl}/current-affairs/favicon.ico`,
        allowEmpty: true,
    };
}

async function processCurrentNews(currentUrl) {
    const response = await ofetch(`${baseUrl}${currentUrl}`);
    const $ = load(response);
    const items = $(`#table-of-content > ul > li > a`)
        .toArray()
        .map((item) => {
            const link = $(item).attr('href');
            const title = $(item).clone().children('span').remove().end().text().trim();
            return {
                title,
                link: title === 'Also in News' ? link : `${baseUrl}${link}`,
                guid: link,
            };
        });

    const normalNews: any = [];
    const alsoInNews: any = [];

    for (const item of items) {
        if (item.title === 'Also in News') {
            alsoInNews.push(item);
        } else {
            normalNews.push(item);
        }
    }
    const finalItems = await Promise.allSettled(
        normalNews.map((item) => processOnePerPage(item))
    );
    const alsoInNewsItems = await processMultiplePerPage(alsoInNews[0]);
    return [...finalItems.map((item) => (item.status === 'fulfilled' ? item.value : { title: 'Error : Something Went Wrong' })), ...alsoInNewsItems];
}

async function processMultiplePerPage(groupedItem) {
    if (groupedItem.link === '') {
        return groupedItem;
    }
    const response = await ofetch(groupedItem.link || '');
    const $$ = load(response);
    const mainGroup = $$('main > div > div.mt-6 > div.flex > div.flex.mt-6 > div.flex > div.w-full');
    const postedDate = mainGroup.find('p:contains("Posted ") > strong').text();
    const shortArticles = mainGroup.find('[x-data^="{isShortArticleOpen"]');
    const items = shortArticles.map((_, element) => {
        const title = $$(element).find('a > div > h1').text().trim();
        const id = $$(element).find('a').attr('href');
        const articleContent = $$(element).find('#article-content').html();
        const tags = $$(element)
            .find('ul > li:contains("Tags :")')
            .nextAll('li')
            .toArray()
            .map((tag) => $$(tag).text());
        const description = art(path.join(__dirname, 'templates/description.art'), {
            heading: title,
            articleContent,
        });
        return {
            title: `${title} | ${groupedItem.title}`,
            pubDate: parseDate(postedDate),
            category: tags,
            description,
            link: `${groupedItem.link}${id}`,
            author: 'Vision IAS',
        } as DataItem;
    });
    return items;
}

async function processOnePerPage(item) {
    if (item.link === '') {
        return item;
    }
    try {
        const response = await ofetch(item.link || '');
        const $$ = load(response);
        const content = $$('main > div > div.mt-6 > div.flex > div.flex.mt-6');
        const heading = content.find('div.space-y-4 > h1').text();
        const mainGroup = content.find('div.flex > div.w-full');
        const postedDate = mainGroup.find('p:contains("Posted ") > strong').text();
        const articleContent = mainGroup.find('#article-content');
        articleContent.find('figure').each((_, element) => {
            $$(element).css('width', '');
        });
        const htmlContent = articleContent.html();
        const tags = mainGroup
            .find('ul > li:contains("Tags :")')
            .nextAll('li')
            .toArray()
            .map((tag) => $$(tag).text());
        const description = art(path.join(__dirname, 'templates/description.art'), {
            heading,
            articleContent: htmlContent,
        });
        return {
            title: item.title,
            pubDate: parseDate(postedDate),
            category: tags,
            description,
            link: item.link,
            author: 'Vision IAS',
        } as DataItem;
    } catch {
        return {
            title: item.title,
            description: 'Unable to Fetch',
            link: item.link,
            author: 'Vision IAS',
        } as DataItem;
    }
}
