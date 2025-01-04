import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

type NewsCategory = {
    title: string;
    description: string;
};

const NEWS_TYPES: Record<string, NewsCategory> = {
    ggl: {
        title: '通知公告',
        description: 'CATTI 考试通知和公告',
    },
    ywdt: {
        title: '要闻动态',
        description: 'CATTI 考试要闻动态',
    },
    zxzc: {
        title: '最新政策',
        description: 'CATTI 考试最新政策',
    },
};

const handler: Route['handler'] = async (context) => {
    const category = context.req.param('category');

    const BASE_URL = `https://www.catticenter.com/${category}`;

    // Fetch the index page
    const { data: listPage } = await got(BASE_URL);
    const $ = load(listPage);

    // Select all list items containing news information
    const ITEM_SELECTOR = 'ul.ui-card.ui-card-a > li';
    const listItems = $(ITEM_SELECTOR);

    // Map through each list item to extract details
    const contentLinkList = listItems.toArray().map((element) => {
        const date = $(element).find('span.ui-right-time').text();
        const title = $(element).find('a').attr('title')!;
        const relativeLink = $(element).find('a').attr('href')!;
        const absoluteLink = `https://www.catticenter.com${relativeLink}`;
        const formattedDate = parseDate(date);
        return {
            date: formattedDate,
            title,
            link: absoluteLink,
        };
    });

    return {
        title: NEWS_TYPES[category].title,
        description: NEWS_TYPES[category].description,
        link: BASE_URL,
        image: 'https://www.catticenter.com/img/applogo.png',
        item: (await Promise.all(
            contentLinkList.map((item) =>
                cache.tryGet(item.link, async () => {
                    const CONTENT_SELECTOR = 'div.ui-article-cont';
                    const { data: contentResponse } = await got(item.link);
                    const contentPage = load(contentResponse);
                    const content = contentPage(CONTENT_SELECTOR).html() || '';
                    return {
                        title: item.title,
                        pubDate: item.date,
                        link: item.link,
                        description: content,
                        category: ['study'],
                        guid: item.link,
                        id: item.link,
                        image: 'https://www.catticenter.com/img/applogo.png',
                        content,
                        updated: item.date,
                        language: 'zh-cn',
                    };
                })
            )
        )) as DataItem[],
        allowEmpty: true,
        language: 'zh-cn',
        feedLink: 'https://rsshub.app/ruankao/news',
        id: 'https://rsshub.app/ruankao/news',
    };
};

export const route: Route = {
    path: '/news/:category',
    name: 'CATTI 考试消息',
    maintainers: ['PrinOrange'],
    description: `
| Category  | 标题       | 描述                |
|-----------|------------|--------------------|
| ggl       | 通知公告   | CATTI 考试通知和公告 |
| ywdt      | 要闻动态   | CATTI 考试要闻动态   |
| zxzc      | 最新政策   | CATTI 考试最新政策   |
`,
    handler,
    categories: ['study'],
    parameters: {
        category: '消息分类名，可在下面的描述中找到。',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    example: '/catti/news/zxzc',
    radar: [
        {
            source: ['www.catticenter.com/:category'],
        },
    ],
};
