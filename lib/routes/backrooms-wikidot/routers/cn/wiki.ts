import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

type Category = {
    title: string;
    description: string;
};

const CATEGORY_TYPES: Record<string, Category> = {
    'most-recently-created': {
        title: '最新页面',
        description: '最新创建的页面',
    },
    // TODO: Add more categories after this website makeover.
};

const handler: Route['handler'] = async (ctx) => {
    const category = ctx.req.param('category');

    const FEED_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/The_Backrooms_logo.png/1024px-The_Backrooms_logo.png';
    const BASE_URL = `https://backrooms-wiki-cn.wikidot.com/${category}`;
    const FEED_LINK = `https://rsshub.app/backrooms-wikidot/cn/wiki/${category}`;

    // Fetch the index page
    const { data: listPage } = await got(BASE_URL);
    const $ = load(listPage);

    // Select all list items containing news information
    const ITEM_SELECTOR = 'div.list-pages-box > div.info-container';
    const listItems = $(ITEM_SELECTOR);

    // Map through each list item to extract details
    const contentLinkList = listItems.toArray().map((element) => {
        const date = $(element).find('div.info-date > span').text();
        const title = $(element).find('span.info-titlename').text()!;
        const relativeLink = $(element).find('div.info-link').find('a').attr('href')!;
        const url = new URL(relativeLink, BASE_URL);
        const absoluteLink = url.href;
        const formattedDate = parseDate(date);
        return {
            date: formattedDate,
            title,
            link: absoluteLink,
        };
    });

    return {
        title: CATEGORY_TYPES[category].title,
        description: CATEGORY_TYPES[category].description,
        link: BASE_URL,
        image: FEED_LOGO,
        item: (await Promise.all(
            contentLinkList.map((item) =>
                cache.tryGet(item.link, async () => {
                    const CONTENT_SELECTOR = '#page-content';
                    const PAGE_INFO_SELECTOR = '#page-info';
                    const { data: contentResponse } = await got(item.link);
                    const contentPage = load(contentResponse);
                    const coverImage = contentPage(CONTENT_SELECTOR).first().find('img').attr('src');
                    const lastUpdated = contentPage(PAGE_INFO_SELECTOR)
                        .find('span.odate')
                        .text()
                        .replaceAll(/\(.*?\)/g, '');
                    const content = contentPage(CONTENT_SELECTOR).html() || '';
                    const dataItem: DataItem = {
                        title: item.title,
                        pubDate: item.date,
                        link: item.link,
                        description: content,
                        category: ['reading'],
                        guid: item.link,
                        id: item.link,
                        image: coverImage ?? FEED_LOGO,
                        content: {
                            html: content,
                            text: content,
                        },
                        updated: lastUpdated,
                        language: 'zh-CN',
                    };
                    return dataItem;
                })
            )
        )) as DataItem[],
        allowEmpty: true,
        language: 'zh-CN',
        feedLink: FEED_LINK,
        id: FEED_LINK,
    };
};

export const route: Route = {
    path: '/cn/wiki/:category',
    name: 'Backrooms 后室 - Wikidot 中文站',
    maintainers: ['PrinOrange'],
    description: ` **注：** 当前仅支持“最新页面”，更多其他目录请等待网站改版后更新。
| Category                         | 标题         | 描述                                        |
| -------------------------------- | ------------ | ------------------------------------------- |
| most-recently-created            | 最新页面     | 最新创建的页面                              |
`,
    handler,
    categories: ['reading'],
    parameters: {
        category: 'Wiki 栏目，可以在表中查询',
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
    example: '/backrooms-wikidot/cn/wiki/most-recently-created',
    radar: [
        {
            source: ['backrooms-wiki.wikidot.com', 'backrooms-wiki-cn.wikidot.com'],
            target: 'backrooms-wikidot/cn/wiki/most-recently-created',
        },
    ],
};
