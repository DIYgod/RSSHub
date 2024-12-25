import { Route, Data, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';

const ROOT_URL = 'https://api-docs.deepseek.com/zh-cn';

const NEWS_LIST_SELECTOR = 'ul.menu__list > li:nth-child(2) ul > li.theme-doc-sidebar-item-link';
const ARTICLE_CONTENT_SELECTOR = '.theme-doc-markdown > div > div';
const ARTICLE_TITLE_SELECTOR = ARTICLE_CONTENT_SELECTOR + ' > h1';

// 获取消息列表 / get article list
const fetchPageContent = async (url: string) => {
    const response = await ofetch(url);
    return load(response);
};

// 提取正文内容 / extract article content
const extractArticleInfo = ($article: cheerio.Root, pageURL: string) => {
    const contentElement = $article(ARTICLE_CONTENT_SELECTOR);
    const title = $article(ARTICLE_TITLE_SELECTOR).text();
    $article(ARTICLE_TITLE_SELECTOR).remove(); // 移除标题，避免重复 / remove title to avoid duplication
    const content = contentElement.html();
    return { title, content, pageURL };
};

const parseDateString = (dateString: string) => {
    const pubDate = new Date(dateString);
    return pubDate.toUTCString();
};

// 创建消息 / create article
const createDataItem = (item: cheerio.Element, $: cheerio.Root): Promise<DataItem> => {
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
    const $ = await fetchPageContent(ROOT_URL);
    const newsList = $(NEWS_LIST_SELECTOR);

    const items: DataItem[] = await Promise.all(newsList.toArray().map((li) => createDataItem(li, $)));

    return {
        title: 'DeepSeek 新闻',
        link: ROOT_URL,
        item: items,
        allowEmpty: true,
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
            source: ['api-docs.deepseek.com'],
            target: '/news',
        },
    ],
    name: '新闻',
    maintainers: ['1837634311'],
    handler,
};
