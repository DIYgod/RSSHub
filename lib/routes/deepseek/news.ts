import { Route, Data, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

const ROOT_URL = 'https://api-docs.deepseek.com/zh-cn';

const NEWS_LIST_SELECTOR = 'ul.menu__list > li:nth-child(2) ul > li.theme-doc-sidebar-item-link';
const ARTICLE_CONTENT_SELECTOR = '.theme-doc-markdown > div > div';
const ARTICLE_TITLE_SELECTOR = '.theme-doc-markdown > div > div > h1';

const fetchPageContent = async (url: string) => {
    const response = await ofetch(url);
    return load(response);
};

const extractArticleInfo = ($article: cheerio.Root, pageURL: string) => {
    const contentElement = $article(ARTICLE_CONTENT_SELECTOR);
    const title = $article(ARTICLE_TITLE_SELECTOR).text();
    $article(ARTICLE_TITLE_SELECTOR).remove();
    const content = contentElement.html();
    return { title, content, pageURL };
};

const parseDateString = (dateString: string) => {
    const pubDate = new Date(dateString);
    return pubDate.toUTCString();
};

const createDataItem = async (item: cheerio.Element, $: cheerio.Root): Promise<DataItem> => {
    const $item = $(item);
    const link = $item.find('a').attr('href');
    const dateString = $item.find('a').text().split(' ').slice(-1)[0];
    const pageURL = new URL(link || '', ROOT_URL).href;

    const $article = await fetchPageContent(pageURL);
    const { title, content } = extractArticleInfo($article, pageURL);
    const pubDate = parseDateString(dateString);

    return {
        title,
        link: pageURL,
        pubDate,
        description: content || undefined,
    };
};

const handler = async (): Promise<Data> => {
    const $ = await fetchPageContent(ROOT_URL);
    const newsList = $(NEWS_LIST_SELECTOR);

    const items: DataItem[] = await Promise.all(
        newsList.toArray().map(async (li) => createDataItem(li, $))
    );

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
