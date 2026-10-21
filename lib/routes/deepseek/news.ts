import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const ROOT_URL = 'https://api-docs.deepseek.com/zh-cn';

const NEWS_LIST_SELECTOR = 'aside li.theme-doc-sidebar-item-link:has(a[href^="/zh-cn/news/"])';
const ARTICLE_CONTENT_SELECTOR = '.theme-doc-markdown > div > div';
const ARTICLE_TITLE_SELECTOR = ARTICLE_CONTENT_SELECTOR + ' > h1';

// Fetch and parse a documentation page.
const fetchPageContent = async (url: string) => {
    const response = await ofetch(url);
    return load(response);
};

// Extract the main article content.
const extractArticleInfo = ($article: CheerioAPI, pageURL: string) => {
    const contentElement = $article(ARTICLE_CONTENT_SELECTOR);
    const title = $article(ARTICLE_TITLE_SELECTOR).text();
    $article(ARTICLE_TITLE_SELECTOR).remove(); // Omit the title from the article body.
    const content = contentElement.html();
    return { title, content, pageURL };
};

const parseDateString = (dateString: string | undefined) => {
    const date = dateString?.match(/\d{4}\/\d{2}\/\d{2}/)?.[0];
    return date ? parseDate(`${date.replaceAll('/', '-')}T00:00:00Z`) : undefined;
};

// Create a feed item from a sidebar entry.
const createDataItem = (item: Element, $: CheerioAPI): Promise<DataItem> => {
    const $item = $(item);
    const link = $item.find('a').attr('href');
    const dateString = $item.find('a').text().split(' ').at(-1);
    const pageURL = new URL(link || '', ROOT_URL).href;

    return cache.tryGet(pageURL, async () => {
        const $article = await fetchPageContent(pageURL);
        const { title, content } = extractArticleInfo($article, pageURL);
        const pubDate = parseDateString(dateString);

        return {
            title,
            link: pageURL,
            pubDate,
            description: content || undefined,
        };
    });
};

const handler = async (): Promise<Data> => {
    const $home = await fetchPageContent(ROOT_URL);
    const newsPath = $home('nav a[href^="/zh-cn/news/"]').first().attr('href');
    if (!newsPath) {
        throw new Error('DeepSeek news navigation link was not found on the documentation homepage');
    }
    const newsUrl = new URL(newsPath, ROOT_URL).href;
    const $ = await fetchPageContent(newsUrl);
    const newsList = $(NEWS_LIST_SELECTOR);

    const entries = newsList.toArray();
    const selected = entries;
    const items: DataItem[] = await pMap(selected, (li) => createDataItem(li, $), { concurrency: 3 });

    return {
        title: 'DeepSeek 新闻',
        link: newsUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/deepseek/news',
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
            source: ['api-docs.deepseek.com', 'api-docs.deepseek.com/zh-cn', 'api-docs.deepseek.com/zh-cn/news/:article', 'api-docs.deepseek.com/news/:article'],
            target: '/news',
        },
    ],
    name: '新闻',
    maintainers: ['1837634311'],
    handler,
};
