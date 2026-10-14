import type { Cheerio } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/:uid',
    categories: ['government'],
    example: '/gov/cn/news/yw',
    parameters: { uid: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '政府新闻',
    maintainers: ['EsuRt', 'howfool'],
    handler,
    description: `| 政务部门 | 滚动新闻 | 新闻要闻 | 国务院新闻 | 国务院工作会议 | 政策文件 |
| :------: | :------: | :------: | :--------: | :------------: | :------: |
|    bm    |    gd    |    yw    |     gwy    |     gwyzzjg    |  zhengce |`,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const originDomain = 'https://www.gov.cn';
    let url = '';
    let title = '';
    let list: Cheerio<Element>;
    switch (uid) {
        case 'bm':
            url = `${originDomain}/lianbo/bumen/index.htm`;
            title = '中国政府网 - 部门政务';
            break;
        case 'yw':
        case 'gd':
            return getLatestNews(uid, originDomain);
        case 'gwy':
            url = `${originDomain}/pushinfo/v150203/`;
            title = '中国政府网 - 国务院信息';
            break;
        case 'zhengce':
            return getPolicyFiles();
        case 'gwyzzjg':
            url = `${originDomain}/gwyzzjg/huiyi/`;
            title = '中国政府网 - 国务院工作会议';
            break;
        default:
            throw new InvalidParameterError('uid must be bm, gd, yw, gwy, gwyzzjg, or zhengce.');
    }
    const listData = await got.get(url);
    const $ = load(listData.data);
    if (url.includes('zhengcelibrary')) {
        list = $('.dys_middle_result_content_item');
    } else if (url.includes('bumen')) {
        list = $('.infolist li');
    } else {
        list = $('.news_box .list li:not(.line)');
    }

    return {
        title,
        link: url,
        item: await Promise.all(
            list.toArray().map((item) => {
                const $item = $(item);
                let contentUrl = $item.find('a').attr('href');
                contentUrl = contentUrl!.startsWith('http') ? contentUrl : new URL(contentUrl!, url).href;
                return cache.tryGet(contentUrl!, async () => {
                    let description;
                    let fullTextData;
                    let fullTextGet;
                    let pubDate;
                    let author;
                    let category: string[] = [];
                    if (/dysMiddleResultConItemTitle/.test($item.html() ?? '')) {
                        if (contentUrl!.includes('content')) {
                            fullTextGet = await got.get(contentUrl);
                            fullTextData = load(fullTextGet.data);
                            fullTextData('.shuzi').remove(); // 移除videobg的图片
                            fullTextData('#myFlash').remove(); // 移除flash
                            description = /pages_content/.test(fullTextData.html()) ? fullTextData('.pages_content').html() : fullTextData('#UCAP-CONTENT').html();
                        } else {
                            description = $item.find('a').text(); // 忽略获取吹风会的全文
                        }
                    } else if (contentUrl!.includes('content')) {
                        fullTextGet = await got.get(contentUrl);
                        fullTextData = load(fullTextGet.data);
                        const $1 = fullTextData.html();
                        if (/zhengceku/.test(contentUrl!)) {
                            // 政策文件库
                            description = fullTextData('.pages_content').html();
                        } else {
                            fullTextData('.shuzi').remove(); // 移除videobg的图片
                            fullTextData('#myFlash').remove(); // 移除flash
                            description = /UCAP-CONTENT/.test($1) ? fullTextData('#UCAP-CONTENT').html() : fullTextData('body').html();
                        }
                    } else {
                        description = $item.find('a').text(); // 忽略获取吹风会的全文
                    }
                    if (fullTextData) {
                        const date = fullTextData('meta[name="firstpublishedtime"]').attr('content');
                        if (date) {
                            pubDate = timezone(parseDate(date, 'YYYY-MM-DD HH:mm:ss'), 8);
                        }
                        author = fullTextData('meta[name="author"]').attr('content');
                        category = (fullTextData('meta[name="keywords"]').attr('content') ?? '').split(/[,;]/);
                    }
                    return {
                        title: $item.find('a').text(),
                        description,
                        link: contentUrl,
                        pubDate,
                        author,
                        category: category.filter(Boolean),
                    };
                });
            })
        ),
    };
}

async function getLatestNews(uid: 'yw' | 'gd', originDomain: string) {
    const link = new URL('/yaowen/liebiao/', originDomain).href;
    const articles = await ofetch<Array<{ TITLE: string; URL: string; DOCRELPUBTIME?: string }>>(new URL('YAOWENLIEBIAO.json', link).href);
    // The official page displays the first 20 records from this JSON list.
    const items = await pMap(
        articles.slice(0, 20),
        async (article): Promise<DataItem> => {
            const url = new URL(article.URL, link).href;
            const detail = await getArticle(url);
            return {
                ...detail,
                title: article.TITLE,
                link: url,
                pubDate: detail.pubDate ?? (article.DOCRELPUBTIME ? timezone(parseDate(article.DOCRELPUBTIME), 8) : undefined),
            };
        },
        { concurrency: 3 }
    );
    return {
        title: `中国政府网 - ${uid === 'yw' ? '新闻要闻' : '滚动新闻'}`,
        link,
        item: items,
    };
}

function getArticle(url: string) {
    return cache.tryGet(`gov:cn:news:${url}`, async () => {
        const response = await got(url);
        const $ = load(response.data);
        const date = $('meta[name="firstpublishedtime"]').attr('content');
        return {
            description: $('#UCAP-CONTENT, .pages_content').first().html() ?? undefined,
            pubDate: date ? timezone(parseDate(date, ['YYYY-MM-DD-HH:mm:ss', 'YYYY-MM-DD HH:mm:ss']), 8) : undefined,
            author: $('meta[name="author"]').attr('content'),
            category: ($('meta[name="keywords"]').attr('content') ?? '').split(/[,;]/).filter(Boolean),
        };
    });
}

async function getPolicyFiles() {
    const rootUrl = 'https://sousuo.www.gov.cn';
    const link = new URL('/zcwjk/policyDocumentLibrary?q=&t=zhengcelibrary&orpro=', rootUrl).href;
    const response = await ofetch<{ code: number; searchVO: { catMap: Record<string, { listVO: Array<{ title: string; url: string; pubtime?: number }> }> } }>(new URL('/search-gov/data', rootUrl).href, {
        query: { t: 'zhengcelibrary', q: '', p: 1, n: 5, inpro: '' },
    });
    if (response.code !== 200 || !response.searchVO?.catMap) {
        throw new TypeError('The official policy library did not return its document list.');
    }
    // The official first page displays five records from each document category.
    const articles = Object.values(response.searchVO.catMap).flatMap((category) => category.listVO);
    const item = await pMap(
        articles,
        async (article): Promise<DataItem> => {
            const detail = await getArticle(article.url);
            return {
                ...detail,
                title: article.title,
                link: article.url,
                pubDate: detail.pubDate ?? (article.pubtime ? parseDate(article.pubtime) : undefined),
            };
        },
        { concurrency: 3 }
    );
    return { title: '中国政府网 - 政策文件', link, item };
}
