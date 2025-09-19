import { type Data, type DataItem, Route } from '@/types';
import { type CheerioAPI, load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const BASE_URL = 'https://www.huijin-inv.cn';

/**
 * The client-side entrypoint to redirect to the post index of the latest year.
 */
const ENTRY_URL = `${BASE_URL}/huijin-inv/Corporate_History/index.shtml`;
const DEFAULT_REDIRECT_PATH = '/huijin-inv/SC20252/Information_Center.shtml';

async function handler(): Promise<Data> {
    const entryRes = await ofetch(ENTRY_URL);
    const $entry: CheerioAPI = load(entryRes);
    const $scripts = $entry('head script');
    let redirectPath = DEFAULT_REDIRECT_PATH;
    $scripts.each((_, el) => {
        const redirectScript = $entry(el).text();
        if (redirectScript !== null) {
            // Get the real index page by JS redirection href. The path may change.
            const match = redirectScript.match(/window\.location\.href\s*=\s*["']([^"']+)["']/);
            if (match) {
                redirectPath = match[1];
            }
        }
    });
    const redirectURL = `${BASE_URL}${redirectPath}`;
    const indexPage = await ofetch(redirectURL);
    const $: CheerioAPI = load(indexPage);
    const title = $('title').text()?.trim();
    const author = $('div.logo a').attr('title')?.trim();
    const items: DataItem[] = $('div.infor-list-item')
        .toArray()
        .map((listItem) => {
            const item = $(listItem);
            const title = item.find('h1').text();
            const pubDate = `${item.find('span.year').text()}.${item.find('span.day').text()}`;
            const href = item.find('a').prop('href');
            const link = href ? (href.startsWith('http') ? href : new URL(href, BASE_URL).href) : BASE_URL;
            const description = item.find('p').text();
            return {
                title,
                link,
                pubDate: timezone(parseDate(pubDate), +8),
                description,
            };
        });
    return {
        item: items,
        title,
        link: BASE_URL,
        description: `${author} - ${title}`,
        author,
        language: 'zh-CN',
    };
}

export const route: Route = {
    path: '/news',
    categories: ['finance'],
    example: '/huijin-inv/news',
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
            source: ['www.huijin-inv.cn/'],
        },
    ],
    name: '资讯中心',
    maintainers: ['la3rence'],
    handler,
    description: '中央汇金投资有限责任公司 - 资讯中心',
};
