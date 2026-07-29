import { load } from 'cheerio';

import ofetch from '@/utils/ofetch';

const ROOT = 'http://paper.people.com.cn/rmrb/pc/layout';

export interface Edition {
    /** 版面编号，例如 `01` */
    page: string;
    /** 版面名称，例如 `第01版 要闻` */
    name: string;
    /** 该版面的绝对链接 */
    url: string;
}

export interface ArticleRef {
    title: string;
    link: string;
}

/**
 * 获取某一天（或最新一期）人民日报的全部版面列表。
 * @param date 格式 `YYYYMMDD`，不传则抓取最新一期
 */
export async function getEditions(date?: string): Promise<Edition[]> {
    const indexUrl = date ? `${ROOT}/${date.slice(0, 4)}${date.slice(4, 6)}/${date.slice(6, 8)}/index.html` : `${ROOT}/index.html`;

    const html = await ofetch(indexUrl);
    const $ = load(html);

    const editions: Edition[] = [];
    $('#list li a').each((_, el) => {
        const a = $(el);
        const href = a.attr('href');
        if (!href || !/node_\d+\.html$/.test(href)) {
            return;
        }
        const pageMatch = href.match(/node_(\d+)\.html$/);
        editions.push({
            page: pageMatch ? pageMatch[1] : '',
            name: a.text().replaceAll(/\s+/g, ' ').trim(),
            url: new URL(href, indexUrl).href,
        });
    });
    return editions;
}

/**
 * 从某个版面页中提取文章链接列表（已过滤责编等非正文条目）。
 */
export async function getArticles(nodeUrl: string): Promise<ArticleRef[]> {
    const html = await ofetch(nodeUrl);
    const $ = load(html);

    const articles: ArticleRef[] = [];
    $('a[href*="content_"]').each((_, el) => {
        const a = $(el);
        const href = a.attr('href');
        if (!href) {
            return;
        }
        const title = a.text().replaceAll(/\s+/g, ' ').trim();
        // 跳过「本版责编」「责任编辑」等排版说明
        if (!title || /责编|责任编辑/.test(title)) {
            return;
        }
        articles.push({
            title,
            link: new URL(href, nodeUrl).href,
        });
    });
    return articles;
}

/**
 * 抓取文章正文，返回经过绝对化的 HTML，以及文章自身的发布日期（若有）。
 */
export async function getArticleContent(articleUrl: string): Promise<{ description: string; pubDate?: Date }> {
    const html = await ofetch(articleUrl);
    const $ = load(html);

    const $article = $('.article');
    // 将相对图片地址改写为绝对地址
    $article.find('img[src]').each((_, el) => {
        const img = $(el);
        const src = img.attr('src');
        if (src) {
            img.attr('src', new URL(src, articleUrl).href);
        }
    });

    const description = $article.html()?.trim() ?? '';

    // 尝试从页面日期标记解析发布时间，例如 `(2026年07月29日 01版)`
    const dateText = $('.date').first().text();
    const dateMatch = dateText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    const pubDate = dateMatch ? new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3])) : undefined;

    return { description, pubDate };
}
