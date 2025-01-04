import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

const BASE_URL = 'https://www.ruankao.org.cn/index/work';

const handler: Route['handler'] = async () => {
    // Fetch the index page
    const { data: listResponse } = await got(BASE_URL);
    const $ = load(listResponse);

    // Select all list items containing news information
    const ITEM_SELECTOR = 'ul[class*="newsList"] > li';
    const listItems = $(ITEM_SELECTOR);

    // Map through each list item to extract details
    const contentLinkList = listItems.toArray().map((element) => {
        const date = $(element).find('label.time').text().trim().slice(1, -1);
        const title = $(element).find('a').attr('title')!;
        const link = $(element).find('a').attr('href')!;

        const formattedDate = parseDate(date);
        return {
            date: formattedDate,
            title,
            link,
        };
    });

    return {
        title: '计算机职业技术资格考试（软考）最新动态',
        description: '计算机职业技术资格考试（软考）网站最新动态和消息推送',
        link: BASE_URL,
        image: 'https://bm.ruankao.org.cn/asset/image/public/logo.png',
        item: (await Promise.all(
            contentLinkList.map((item) =>
                cache.tryGet(item.link, async () => {
                    const CONTENT_SELECTOR = '#contentTxt';
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
                        image: 'https://bm.ruankao.org.cn/asset/image/public/logo.png',
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
    path: '/news',
    name: '软考最新动态',
    maintainers: ['PrinOrange'],
    handler,
    categories: ['study'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    radar: [
        {
            title: '软考新闻动态',
            source: ['www.ruankao.org.cn/index/work', 'www.ruankao.org.cn'],
            target: `/news`,
        },
    ],
    example: '/ruankao/news',
};
