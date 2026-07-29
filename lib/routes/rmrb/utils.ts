import { load } from 'cheerio';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const ROOT = 'https://paper.people.com.cn/rmrb/pc/layout';

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
 * 获取最新一期人民日报的全部版面列表。
 */
export async function getEditions(): Promise<Edition[]> {
    const indexUrl = `${ROOT}/index.html`;

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
 * 从某个版面页的文章列表（`.news-list`）中提取文章链接。
 * 注：「本版责编」等非正文条目与文章结构完全一致（同为 li > a，href 同为 content_xxx.html），
 * 无法用纯结构选择器区分，故保留针对其标题的最小过滤。
 */
export async function getArticles(nodeUrl: string): Promise<ArticleRef[]> {
    const html = await ofetch(nodeUrl);
    const $ = load(html);

    const articles: ArticleRef[] = [];
    $('.news-list a').each((_, el) => {
        const a = $(el);
        const href = a.attr('href');
        if (!href || !/content_\d+\.html$/.test(href)) {
            return;
        }
        const title = a.text().replaceAll(/\s+/g, ' ').trim();
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

    // 尝试从页面日期标记解析发布时间，例如 `(2026年07月29日 05版)`
    const dateText = $('.date').first().text();
    const dateMatch = dateText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    const pubDate = dateMatch ? parseDate(`${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`, 'YYYY-MM-DD') : undefined;

    return { description, pubDate };
}
