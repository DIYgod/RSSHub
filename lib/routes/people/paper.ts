import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://paper.people.com.cn/rmrb/pc/';
const indexUrl = `${rootUrl}layout/index.html`;
const defaultLimit = 30;

type PaperPage = {
    id: string;
    title: string;
    url: string;
};

type PaperArticle = DataItem & {
    link: string;
};

const normalizeText = (text: string) => text.replaceAll(/\s+/g, ' ').trim();

const fetchHtml = (url: string) => cache.tryGet(url, () => ofetch<string>(url));

const getEditionDate = (url: string) => {
    const match = url.match(/\/(\d{4})(\d{2})\/(\d{2})\//);
    if (!match) {
        throw new Error('Unable to determine the current People’s Daily edition date');
    }
    return `${match[1]}年${match[2]}月${match[3]}日`;
};

const getPages = async () => {
    const html = await fetchHtml(indexUrl);
    const $ = load(html);
    const pages = $('#list li a[href]')
        .toArray()
        .map((element) => {
            const href = $(element).attr('href') ?? '';
            const id = href.match(/node_(\d+)\.html/)?.[1];
            return id
                ? {
                      id,
                      title: normalizeText($(element).text()),
                      url: new URL(href, indexUrl).href,
                  }
                : undefined;
        })
        .filter((page): page is PaperPage => Boolean(page));

    if (pages.length === 0) {
        throw new Error('No pages found in the current People’s Daily edition');
    }
    return pages;
};

const getArticles = async (page: PaperPage, pubDate: Date): Promise<PaperArticle[]> => {
    const html = await fetchHtml(page.url);
    const $ = load(html);
    return $('.news-list a[href]')
        .toArray()
        .map((element) => ({
            title: normalizeText($(element).text()),
            link: new URL($(element).attr('href') ?? '', page.url).href,
            category: [page.title],
            pubDate,
        }));
};

const getArticleDetail = async (article: PaperArticle): Promise<PaperArticle> => {
    try {
        return await cache.tryGet(article.link, async () => {
            const html = await ofetch<string>(article.link);
            const $ = load(html);
            const content = $('#ozoom');

            content.find('img[src]').each((_, image) => {
                const src = $(image).attr('src');
                if (src) {
                    $(image).attr('src', new URL(src, article.link).href);
                }
            });
            content.find('a[href]').each((_, anchor) => {
                const href = $(anchor).attr('href');
                if (href) {
                    $(anchor).attr('href', new URL(href, article.link).href);
                }
            });

            const byline = $('.article > .sec').clone();
            byline.find('.date').remove();
            const author = normalizeText(byline.text());
            const date = normalizeText($('.article > .sec .newstime').first().text());

            return {
                ...article,
                title: normalizeText($('.article > h1').text()) || article.title,
                description: content.html()?.trim(),
                pubDate: date ? parseDate(date, 'YYYY年MM月DD日') : article.pubDate,
                author: author || undefined,
            };
        });
    } catch {
        return article;
    }
};

export const route: Route = {
    path: '/paper/:page?',
    categories: ['traditional-media'],
    example: '/people/paper',
    parameters: { page: '版面编号，如 `01`；使用 `all` 或留空获取全部版面' },
    radar: [
        {
            source: ['paper.people.com.cn/rmrb/pc/layout/index.html'],
            target: '/paper',
        },
    ],
    name: '人民日报电子版',
    maintainers: ['pseudoyu'],
    handler,
    url: 'paper.people.com.cn/rmrb/pc/layout/index.html',
    description: '获取当日《人民日报》全部版面或指定版面的文章。',
};

async function handler(ctx) {
    const requestedPage = ctx.req.param('page') ?? 'all';
    const limit = Number(ctx.req.query('limit') ?? defaultLimit);
    const pages = await getPages();
    const normalizedPage = /^\d{1,2}$/.test(requestedPage) ? requestedPage.padStart(2, '0') : requestedPage;
    const selectedPage = normalizedPage === 'all' ? undefined : pages.find((page) => page.id === normalizedPage);

    if (normalizedPage !== 'all' && !selectedPage) {
        throw new InvalidParameterError(`Invalid page '${requestedPage}'`);
    }

    const editionDate = getEditionDate(pages[0].url);
    const pubDate = parseDate(editionDate, 'YYYY年MM月DD日');
    const targetPages = selectedPage ? [selectedPage] : pages;
    const articleLists = await pMap(targetPages, (page) => getArticles(page, pubDate), { concurrency: 5 });
    const uniqueArticles = new Map(articleLists.flat().map((article) => [article.link, article])).values().toArray().slice(0, limit);
    const items = await pMap(uniqueArticles, getArticleDetail, { concurrency: 5 });

    return {
        title: `人民日报电子版${selectedPage ? ` - ${selectedPage.title}` : ''} - ${editionDate}`,
        link: selectedPage?.url ?? indexUrl,
        item: items,
    };
}
