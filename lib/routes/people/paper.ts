import { load } from 'cheerio';

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

const getEditionDate = (url: string) => {
    const match = url.match(/\/(\d{4})(\d{2})\/(\d{2})\//);
    if (!match) {
        throw new Error('Unable to determine the current People’s Daily edition date');
    }
    return `${match[1]}年${match[2]}月${match[3]}日`;
};

const getPages = async () => {
    const html = await ofetch<string>(indexUrl);
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

const getArticles = (page: PaperPage, pubDate: Date): Promise<PaperArticle[]> =>
    cache.tryGet(page.url, async () => {
        const html = await ofetch<string>(page.url);
        const $ = load(html);
        return $('.news-list a[href]')
            .toArray()
            .map((element) => ({
                title: normalizeText($(element).text()),
                link: new URL($(element).attr('href') ?? '', page.url).href,
                category: [page.title],
                pubDate,
            }));
    });

const getArticleDetail = (article: PaperArticle): Promise<PaperArticle> =>
    cache.tryGet(article.link, async () => {
        const html = await ofetch<string>(article.link);
        const $ = load(html);
        const content = $('#ozoom');

        const byline = $('.article > .sec');
        const date = normalizeText(byline.find('.newstime').text());
        byline.find('.date').remove();
        const author = normalizeText(byline.text());

        return {
            ...article,
            title: normalizeText($('.article > h1').text()) || article.title,
            description: content.html()?.trim(),
            pubDate: date ? parseDate(date, 'YYYY年MM月DD日') : article.pubDate,
            author: author || undefined,
        };
    });

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
    const articleLists = await Promise.all(targetPages.map((page) => getArticles(page, pubDate)));
    const articles = articleLists.flat().slice(0, limit);
    const items = await Promise.all(articles.map((article) => getArticleDetail(article)));

    return {
        title: `人民日报电子版${selectedPage ? ` - ${selectedPage.title}` : ''} - ${editionDate}`,
        link: selectedPage?.url ?? indexUrl,
        item: items,
    };
}
