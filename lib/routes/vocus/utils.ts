import { load } from 'cheerio';
import { isTag } from 'domhandler';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://vocus.cc';
const apiUrl = 'https://api.vocus.cc';
interface ArticleList {
    _id: string;
    title: string;
    abstract?: string;
    createdAt: string;
    lastPublishAt?: string;
    updatedAt?: string;
    user: {
        fullname: string;
    };
}
interface ArticleEntry {
    articleId: string;
    item: DataItem;
}
function parseArticleDate(value?: string) {
    return value && value !== '0001-01-01T00:00:00Z' && Number.isFinite(Date.parse(value)) ? parseDate(value) : undefined;
}
const processList = (articleData: ArticleList[]): ArticleEntry[] =>
    articleData.map((article) => ({
        articleId: article._id,
        item: {
            title: article.title,
            description: article.abstract,
            pubDate: parseArticleDate(article.lastPublishAt),
            updated: parseArticleDate(article.updatedAt),
            link: `${baseUrl}/article/${article._id}`,
            author: article.user.fullname,
        },
    }));
async function fetchArticle(articleId: string, link: string): Promise<Pick<DataItem, 'description' | 'category'>> {
    const {
        data: { article },
    } = await got(`${apiUrl}/api/article/${articleId}`, { headers: { referer: link } });
    const $ = load(article.content, null, false);
    $('div.draft--imgNormal').each((_, element) => {
        if (isTag(element)) {
            element.name = 'figure';
        }
    });
    $('.image-block-prerender').each((_, element) => {
        if (!(isTag(element) && element.attribs['data-src'])) {
            return;
        }
        element.name = 'img';
        element.attribs.src = element.attribs['data-src'];
    });
    return { description: $.html(), category: article.tags?.map((tag) => tag.title) };
}
const processFeed = (list: ArticleEntry[]) =>
    pMap(
        list,
        async ({ articleId, item }) => {
            const detail = await cache.tryGet(`vocus:article:v2:${item.link}`, () => fetchArticle(articleId, item.link!));
            return { ...item, description: detail.description || item.description, category: detail.category };
        },
        { concurrency: 3, stopOnError: false }
    );
export { apiUrl, baseUrl, processFeed, processList };
